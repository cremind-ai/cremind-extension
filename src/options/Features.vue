<template>
  <ElCard>
    <ElCard style="margin-top: 10px; margin-bottom: 10px; border-radius: 20px">
      <ElButton
        :color="LOGO_COLOR"
        type="primary"
        @click="handleResetAllVariables"
        size="large"
        :plain="isDark"
      >
        <Icon
          icon="solar:restart-bold-duotone"
          :style="{ fontSize: '20px', paddingRight: '10px' }"
        />
        Reset All
      </ElButton>
    </ElCard>
    <div class="feature-grid">
      <div
        v-for="(feature, index) in featureList"
        :key="index"
        class="feature-card"
      >
        <PromptCardSetting
          :id="index"
          :title="feature.title"
          :description="feature.description"
          @enable-change="handleEnableChange"
          @reset-variable="handleResetVariable"
          v-model:enable="switchStates[index]"
          :supportModes="supportModes[index]"
        ></PromptCardSetting>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { watch, computed, onMounted, ref, Ref } from "vue";
import { ElContainer } from "element-plus";
import { ElHeader } from "element-plus";
import { ElMain } from "element-plus";
import { ElFooter } from "element-plus";
import { ElButton } from "element-plus";
import { ElCard } from "element-plus";
import { ElForm } from "element-plus";
import { ElFormItem } from "element-plus";
import { ElSwitch } from "element-plus";
import { Icon } from "@iconify/vue";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { consoleLog, LogLevelEnum } from "@/utils";
import {
  CommunicationMessageTypeEnum,
  IPCTopicEnum,
  IPCMessageType,
  featureModeEnum,
} from "@/types";
import { FeatureSchema, Icon as IconType } from "@/lib/features";
import { PromptCardSetting } from "@/components";
import { useUserSettingsStore } from "@/store/user_settings";
import { LOGO_COLOR, LOGO_COLOR_DARK } from "@/constants";

const userSettings = useUserSettingsStore();

const featureList: Ref<FeatureSchema[]> = ref([]);
const switchStates: Ref<boolean[]> = ref([]);
const supportModes: Ref<featureModeEnum[][]> = ref([]);
const isDark = computed(() => userSettings.getIsDark);

const getFeatureEnabledState = async (
  feature: FeatureSchema
): Promise<boolean> => {
  const value = await ChromeStorage.getInstance().get(
    `FEATURE:${feature.id}:enable`
  );
  if (value === undefined) {
    await ChromeStorage.getInstance().set(`FEATURE:${feature.id}:enable`, true);
    return true;
  } else if (value === false) {
    return false;
  } else {
    return true;
  }
};

const handleResetAllVariables = async () => {
  await ChromeStorage.getInstance().removeWithWildcard("FEATURE:");
  initialize();
};

const handleEnableChange = async (index: number, value: boolean) => {
  switchStates.value[index] = value;
  await ChromeStorage.getInstance().set(
    `FEATURE:${featureList.value[index].id}:enable`,
    value
  );
};
const handleResetVariable = (index: number) => {
  for (let key in featureList.value[index]) {
    if (
      key === featureModeEnum.EDITABLE ||
      key === featureModeEnum.READONLY ||
      key === featureModeEnum.EDITABLE_CONTEXT_MENU ||
      key === featureModeEnum.READONLY_CONTEXT_MENU ||
      key === featureModeEnum.APP
    ) {
      ChromeStorage.getInstance().removeWithWildcard(
        `FEATURE:${featureList.value[index].id}:${key}:variable`
      );
    }
  }
};

const handleDarkMode = () => {
  userSettings.setIsDark(isDark.value);
};

async function initialize() {
  const data: IPCMessageType = {
    topic: IPCTopicEnum.COMMUNICATION,
    type: CommunicationMessageTypeEnum.GET_FEATURES,
    message: "Get JSON Features",
  };
  chrome.runtime.sendMessage(data, async (response) => {
    if (response.features) {
      featureList.value = response.features;

      switchStates.value = await Promise.all(
        response.features.map((feature: any) => getFeatureEnabledState(feature))
      );

      for (let i = 0; i < featureList.value.length; i++) {
        supportModes.value[i] = [];
        if (featureList.value[i].READONLY) {
          supportModes.value[i].push(featureModeEnum.READONLY);
        }
        if (featureList.value[i].EDITABLE) {
          supportModes.value[i].push(featureModeEnum.EDITABLE);
        }
        if (featureList.value[i].READONLY_CONTEXT_MENU) {
          supportModes.value[i].push(featureModeEnum.READONLY_CONTEXT_MENU);
        }
        if (featureList.value[i].EDITABLE_CONTEXT_MENU) {
          supportModes.value[i].push(featureModeEnum.EDITABLE_CONTEXT_MENU);
        }
        if (featureList.value[i].APP) {
          supportModes.value[i].push(featureModeEnum.APP);
        }
      }
    } else {
      featureList.value = [];
    }
  });
}

onMounted(async () => {
  initialize();
  await userSettings.initialize();
});
</script>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.feature-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>

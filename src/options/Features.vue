<template>
  <ElCard>
    <ElCard style="margin-top: 10px; margin-bottom: 10px; border-radius: 20px">
      <ElForm :inline="true" size="large">
        <ElFormItem>
          <ElButton
            :color="LOGO_COLOR"
            type="primary"
            @click="handleResetAllVariables"
            :plain="isDark"
          >
            <Icon
              icon="solar:restart-bold-duotone"
              :style="{ fontSize: '20px', paddingRight: '10px' }"
            />
            Reset All
          </ElButton>
        </ElFormItem>
        <ElFormItem>
          <ElSelect
            v-model="currentCategory"
            placeholder="Categories"
            filterable
            @change="handleChangeCategory"
          >
            <ElOption
              v-for="option in CategoryOptions"
              :key="option"
              :label="option"
              :value="option"
            ></ElOption>
          </ElSelect>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <div class="feature-grid">
      <div v-for="(feature, index) in featureList" :key="index">
        <PromptCardSetting
          :id="index"
          :title="feature.title"
          :description="feature.description"
          @enable-change="handleEnableChange"
          @reset-variable="handleResetVariable"
          v-model:enable="feature.enabled"
          :supportModes="supportModes[index]"
        ></PromptCardSetting>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { watch, computed, onMounted, ref, Ref } from "vue";
import { ElSelect } from "element-plus";
import { ElOption } from "element-plus";
import { ElButton } from "element-plus";
import { ElCard } from "element-plus";
import { ElForm } from "element-plus";
import { ElFormItem } from "element-plus";
import { Icon } from "@iconify/vue";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { consoleLog, LogLevelEnum } from "@/utils";
import {
  CommunicationMessageTypeEnum,
  IPCTopicEnum,
  IPCMessageType,
  FeatureModeEnum,
} from "@/types";
import {
  CategoryFeatureEnum,
  FeatureSchema,
  Icon as IconType,
} from "@/lib/features";
import { PromptCardSetting } from "@/components";
import { useUserSettingsStore } from "@/store/user_settings";
import {
  LOGO_COLOR,
  LOGO_COLOR_DARK,
  MAXIMUM_FEATURES_SIZE_DEFAULT,
} from "@/constants";
import { getJsonFeatures, setJsonFeature } from "@/lib/common";

const userSettings = useUserSettingsStore();

const featureList: Ref<FeatureSchema[]> = ref([]);
const supportModes: Ref<FeatureModeEnum[][]> = ref([]);
const isDark = computed(() => userSettings.getIsDark);

const currentCategory: Ref<CategoryFeatureEnum | string> = ref("");
const CategoryOptions = Object.values(CategoryFeatureEnum);

async function getFeatures(category: CategoryFeatureEnum) {
  const resFeatures = await getJsonFeatures(
    false,
    1,
    MAXIMUM_FEATURES_SIZE_DEFAULT,
    null,
    category
  );
  if (resFeatures.list) {
    featureList.value = resFeatures.list;

    for (let i = 0; i < featureList.value.length; i++) {
      supportModes.value[i] = [];
      if (featureList.value[i].READONLY) {
        supportModes.value[i].push(FeatureModeEnum.READONLY);
      }
      if (featureList.value[i].EDITABLE) {
        supportModes.value[i].push(FeatureModeEnum.EDITABLE);
      }
      if (featureList.value[i].PROMPT) {
        supportModes.value[i].push(FeatureModeEnum.PROMPT);
      }
      if (featureList.value[i].UPLOAD) {
        supportModes.value[i].push(FeatureModeEnum.UPLOAD);
      }
    }
  } else {
    featureList.value = [];
  }
}

const handleResetAllVariables = async () => {
  await ChromeStorage.getInstance().removeWithWildcard("FEATURES_JSON:");
  initialize();
};

const handleEnableChange = async (index: number, value: boolean) => {
  featureList.value[index].enabled = value;
  setJsonFeature(featureList.value[index]);
};

const handleResetVariable = (index: number) => {
  for (let key in featureList.value[index]) {
    if (
      key === FeatureModeEnum.EDITABLE ||
      key === FeatureModeEnum.READONLY ||
      key === FeatureModeEnum.PROMPT ||
      key === FeatureModeEnum.UPLOAD
    ) {
      ChromeStorage.getInstance().remove(
        `FEATURES_JSON:${featureList.value[index].id}`
      );
    }
  }
};

const handleChangeCategory = (value: string) => {
  const categoryEnum: CategoryFeatureEnum = value as CategoryFeatureEnum;
  getFeatures(categoryEnum);
};

const handleDarkMode = () => {
  userSettings.setIsDark(isDark.value);
};

function initialize() {
  getFeatures(CategoryFeatureEnum.ALL);
}

onMounted(async () => {
  initialize();
  await userSettings.initialize(true);
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

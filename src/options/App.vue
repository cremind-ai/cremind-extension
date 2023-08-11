<template>
  <ElContainer>
    <ElHeader></ElHeader>
    <ElMain>
      <div style="max-width: 600px; margin: 0 auto">
        <ElCard>
          <ElCard style="margin-top: 10px; margin-bottom: 10px">
            <ElForm label-position="right" label-width="160px">
              <ElFormItem label="Reset all settings">
                <ElButton type="primary" @click="handleResetAllVariables">
                  <Icon
                    icon="solar:restart-bold-duotone"
                    :style="{ fontSize: '20px' }"
                  />
                </ElButton>
              </ElFormItem>
            </ElForm>
          </ElCard>
          <ElCard
            style="margin-top: 10px; margin-bottom: 10px"
            v-for="(feature, index) in featureList"
            :key="index"
          >
            <ElForm label-position="right" label-width="120px">
              <ElFormItem label="Description">
                {{ feature.description }}
              </ElFormItem>
              <ElFormItem label="Enable">
                <ElSwitch
                  v-model="switchStates[index]"
                  @change="handleSwitchChange(feature, switchStates[index])"
                />
              </ElFormItem>
              <ElFormItem label="Reset variable">
                <ElButton type="primary" @click="handleResetVariable(feature)">
                  <Icon
                    icon="solar:restart-bold-duotone"
                    :style="{ fontSize: '20px' }"
                  />
                </ElButton>
              </ElFormItem>
              <ElFormItem label="Support mode">
                <div
                  v-if="feature.READONLY"
                  style="display: flex; align-items: center"
                >
                  <Icon
                    :icon="feature.READONLY?.Icon.content || ''"
                    :style="{ fontSize: feature.READONLY?.Icon.fontSize }"
                    v-if="feature.READONLY?.Icon.type === 'icon'"
                  />
                  <div
                    v-if="feature.READONLY?.Icon.type === 'svg'"
                    v-html="feature.READONLY?.Icon.content"
                  ></div>
                  <span style="margin-left: 5px; margin-right: 8px"
                    >READONLY</span
                  >
                </div>
                <div
                  v-if="feature.EDITABLE"
                  style="display: flex; align-items: center"
                >
                  <Icon
                    :icon="feature.EDITABLE?.Icon.content || ''"
                    :style="{ fontSize: feature.EDITABLE?.Icon.fontSize }"
                    v-if="feature.EDITABLE?.Icon.type === 'icon'"
                  />
                  <div
                    v-if="feature.EDITABLE?.Icon.type === 'svg'"
                    v-html="feature.EDITABLE?.Icon.content"
                  ></div>
                  <span style="margin-left: 5px; margin-right: 8px"
                    >EDITABLE</span
                  >
                </div>
                <div
                  v-if="feature.EDITABLE_CONTEXT_MENU"
                  style="display: flex; align-items: center"
                >
                  <Icon
                    :icon="feature.EDITABLE_CONTEXT_MENU?.Icon.content || ''"
                    :style="{
                      fontSize: feature.EDITABLE_CONTEXT_MENU?.Icon.fontSize,
                    }"
                    v-if="feature.EDITABLE_CONTEXT_MENU?.Icon.type === 'icon'"
                  />
                  <div
                    v-if="feature.EDITABLE_CONTEXT_MENU?.Icon.type === 'svg'"
                    v-html="feature.EDITABLE_CONTEXT_MENU?.Icon.content"
                  ></div>
                  <span style="margin-left: 5px; margin-right: 8px"
                    >EDITABLE_CONTEXT_MENU</span
                  >
                </div>
              </ElFormItem>
            </ElForm>
          </ElCard>
        </ElCard>
      </div>
    </ElMain>
    <ElFooter></ElFooter>
  </ElContainer>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
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
import { ChromeStorage } from "../hooks/chrome_storage";
import { consoleLog, LogLevelEnum } from "../utils";
import {
  CommunicationMessageTypeEnum,
  IPCTopicEnum,
  IPCMessageType,
  selectedModeEnum,
} from "../types";
import { FeatureSchema, Icon as IconType } from "../lib/features";

const featureList: Ref<FeatureSchema[]> = ref([]);
const switchStates: Ref<boolean[]> = ref([]);

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

const handleResetVariable = (feature: FeatureSchema) => {
  consoleLog(LogLevelEnum.DEBUG, feature);
  for (let key in feature) {
    if (
      key === selectedModeEnum.EDITABLE ||
      key === selectedModeEnum.READONLY ||
      key === selectedModeEnum.EDITABLE_CONTEXT_MENU
    ) {
      ChromeStorage.getInstance().removeWithWildcard(
        `FEATURE:${feature.id}:${key}:variable`
      );
    }
  }
};

const handleSwitchChange = async (feature: FeatureSchema, value: boolean) => {
  await ChromeStorage.getInstance().set(`FEATURE:${feature.id}:enable`, value);
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
        response.features.map((feature) => getFeatureEnabledState(feature))
      );
    } else {
      featureList.value = [];
    }
  });
}

onMounted(() => {
  initialize();
});
</script>

<style scoped>
.popupview {
  width: 100%;
  height: 100%;
  padding: 5px;
  background-color: white;
  font-size: 16px;
  color: black;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.popupview__user-icon img {
  width: 40px;
  border-radius: 20px;
}

.popupview__user {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.popupview__user-logout {
  padding: 3px 12px;
  border-radius: 10px;
  background-color: white;
  border: 1px solid gray;
  color: black;
}

.popupview__user-logout:hover {
  background-color: lightgray;
}
</style>

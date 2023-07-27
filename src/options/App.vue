<template>
  <ElContainer>
    <ElHeader></ElHeader>
    <ElMain>
      <div style="max-width: 600px; margin: 0 auto">
        <ElCard>
          <ElCard style="margin-top: 10px; margin-bottom: 10px">
            <ElButton type="primary" @click="handleResetAllVariables">
              Reset all variables
            </ElButton>
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
                <ElSwitch />
              </ElFormItem>
              <ElFormItem label="Reset variable">
                <ElButton type="primary" @click="handleResetVariable(feature)">
                  Reset variable
                </ElButton>
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
import { onMounted, ref, watch, Ref } from "vue";
import { ElInput } from "element-plus";
import { ElContainer } from "element-plus";
import { ElHeader } from "element-plus";
import { ElMain } from "element-plus";
import { ElFooter } from "element-plus";
import { ElButton } from "element-plus";
import { ElCard } from "element-plus";
import { ElForm } from "element-plus";
import { ElFormItem } from "element-plus";
import { ElSwitch } from "element-plus";
import { ElSelect } from "element-plus";
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

const handleResetAllVariables = () => {
  ChromeStorage.getInstance().removeWithWildcard("FEATURE:");
};

const handleResetVariable = (feature: FeatureSchema) => {
  consoleLog(LogLevelEnum.DEBUG, feature);
  for (let key in feature) {
    if (
      key === selectedModeEnum.EDITABLE ||
      key === selectedModeEnum.READONLY ||
      key === selectedModeEnum.EDITABLE_NO_CONTENT
    ) {
      ChromeStorage.getInstance().removeWithWildcard(`FEATURE:${feature.id}`);
      `FEATURE:${feature.id}:${key}:variable`;
    }
  }
};

onMounted(async () => {
  const data: IPCMessageType = {
    topic: IPCTopicEnum.COMMUNICATION,
    type: CommunicationMessageTypeEnum.GET_FEATURES,
    message: "Get JSON Features",
  };
  chrome.runtime.sendMessage(data, (response) => {
    if (response.decrypted) {
      featureList.value = response.decrypted;
    } else {
      featureList.value = [];
    }
  });
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

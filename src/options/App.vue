<template>
  <ElContainer>
    <ElHeader></ElHeader>
    <ElMain>
      <div style="max-width: 600px; margin: 0 auto">
        <ElCard>
          <ElButton type="primary">Primary</ElButton>
          <ElButton type="primary">Primary</ElButton>
          <ElButton type="primary">Primary</ElButton>
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

onMounted(async () => {
  const data: IPCMessageType = {
    topic: IPCTopicEnum.COMMUNICATION,
    type: CommunicationMessageTypeEnum.GET_FEATURES,
    message: "Get JSON Features",
  };
  chrome.runtime.sendMessage(data, (response) => {
    if (response.decrypted) {
      featureList.value = response.decrypted;
      consoleLog(LogLevelEnum.DEBUG, featureList.value);
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

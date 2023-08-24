<template>
  <div class="popupview">
    CreMind AI
    <LoadImg
      class="cremind-icon-bar"
      :filename="'CreMind-logo-500.png'"
      :width="50"
    />
    <ElButton class="settings" type="success" plain @click="handleSettings">
      <Icon icon="solar:settings-line-duotone" :style="{ fontSize: '20px' }" />
    </ElButton>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus";
import { Icon } from "@iconify/vue";
import { onMounted, ref, watch } from "vue";
import {
  CommunicationMessageTypeEnum,
  IPCTopicEnum,
  IPCMessageType,
  selectedModeEnum,
} from "@/types";
import { LoadImg } from "@/components";

const handleSettings = () => {
  const data: IPCMessageType = {
    topic: IPCTopicEnum.COMMUNICATION,
    type: CommunicationMessageTypeEnum.OPEN_OPTIONS_PAGE,
    message: "Open options page",
  };
  chrome.runtime.sendMessage(data, () => {});
};

onMounted(async () => {});
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

.settings {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}
</style>

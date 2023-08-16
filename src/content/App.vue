<template>
  <MainCard
    :selectedText="selectedText"
    :top="top"
    :left="left"
    :show="showMainCard"
    :selectedMode="selectedMode"
    @close="handleMainCardClose"
  />

  <div class="cremind-features">
    <LoadImg
      :filename="'CreMind-logo-white-128.png'"
      :width="45"
      @mouseover="showFeatures"
      @mouseout="hideFeatures"
    />
    <div
      v-if="featureVisible"
      @mouseover="showFeatures"
      @mouseout="hideFeatures"
    >
      <ElTooltip content="Settings" placement="bottom">
        <div class="settings">
          <Icon
            icon="solar:settings-line-duotone"
            :style="{ fontSize: '30px' }"
            @click="handleSettings"
          />
        </div>
      </ElTooltip>
      <ElTooltip content="Start Chat" placement="top">
        <div class="button-chatting">
          <Icon
            icon="fluent:chat-12-filled"
            :style="{ fontSize: '30px' }"
            @click="handleStartChat"
          />
        </div>
      </ElTooltip>
      <ElTooltip content="Apps" placement="top">
        <div class="apps">
          <Icon
            icon="icon-park-twotone:more-app"
            :style="{ fontSize: '25px' }"
          />
        </div>
      </ElTooltip>
    </div>
  </div>
  <ChatDialog />
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { ElTooltip } from "element-plus";
import { MainCard } from "@/components";
import { ChatDialog } from "@/components";
import { LoadImg } from "@/components";
import { SystemVariableParser } from "@/lib";
import {
  CommunicationMessageTypeEnum,
  IPCMessageType,
  IPCTopicEnum,
  selectedModeEnum,
} from "@/types";
import { consoleLog, LogLevelEnum } from "@/utils";
import { useUserSettingsStore } from "@/store/user_settings";
import { useChatDialogStore } from "@/store/chat_dialog";

const userSettings = useUserSettingsStore();
const chatDialog = useChatDialogStore();

const selectedText = ref("");
const mousedownSelectedText = ref(false);
const top = ref("");
const left = ref("");
const topMousedown = ref("");
const leftMousedown = ref("");
const showMainCard = ref(false);
const selectedMode: Ref<selectedModeEnum> = ref(
  selectedModeEnum.EDITABLE_CONTEXT_MENU
);
const featureVisible = ref(false);
const chatVisible = ref(false);
const isDark = ref(userSettings.getIsDark);
let showFeaturesTimeout: any;

watch(
  () => userSettings.getIsDark,
  (value) => {
    isDark.value = value;
  }
);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (!showMainCard.value) {
    const activeElement = document.activeElement as HTMLElement;
    if (
      activeElement &&
      ((activeElement as HTMLElement).isContentEditable ||
        activeElement.nodeName.toUpperCase() === "TEXTAREA" ||
        activeElement.nodeName.toUpperCase() === "INPUT")
    ) {
      selectedText.value = window.getSelection()!.toString().trim();
      selectedMode.value = selectedModeEnum.EDITABLE_CONTEXT_MENU;
    } else {
      selectedText.value = "";
      selectedMode.value = selectedModeEnum.READONLY_CONTEXT_MENU;
    }
    top.value = topMousedown.value;
    left.value = leftMousedown.value;
    showMainCard.value = true;
  }
});

document.addEventListener("mousedown", function (event: MouseEvent) {
  const selectionText = window.getSelection()?.toString().trim();
  if (selectionText) {
    mousedownSelectedText.value = true;
  } else {
    mousedownSelectedText.value = false;
  }
  topMousedown.value = `${event.clientY + window.scrollY}px`;
  leftMousedown.value = `${event.clientX + window.scrollX}px`;
});

document.addEventListener("mouseup", function (event: MouseEvent) {
  var selection = window.getSelection();
  let selectionText = selection!.toString().trim();
  var range = selection!.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const activeElement = document.activeElement as HTMLElement;
  if (selectionText && !mousedownSelectedText.value && !showMainCard.value) {
    selectedText.value = selectionText;
    SystemVariableParser.getInstance().setSelectedText(selectionText);
    var rects = range.getClientRects();
    if (rects.length > 0) {
      top.value = `${rect.bottom + window.scrollY + 10}px`;
      left.value = `${rect.left + window.scrollX}px`;
    } else {
      top.value = `${event.clientY + window.scrollY + 15}px`;
      left.value = `${event.clientX + window.scrollX}px`;
    }
    if (
      activeElement &&
      (activeElement.isContentEditable ||
        activeElement.nodeName.toUpperCase() === "TEXTAREA" ||
        activeElement.nodeName.toUpperCase() === "INPUT")
    ) {
      selectedMode.value = selectedModeEnum.EDITABLE;
    } else {
      selectedMode.value = selectedModeEnum.READONLY;
    }
    showMainCard.value = true;
  }
});

document.addEventListener("keyup", function (event: KeyboardEvent) {
  const pressedKey = event.key;
  const selectionText = window.getSelection()?.toString().trim();
  if (pressedKey === "Shift" || pressedKey === "Meta") {
    if (selectionText && !showMainCard.value) {
      selectedText.value = selectionText;
      SystemVariableParser.getInstance().setSelectedText(selectionText);
      top.value = topMousedown.value;
      left.value = leftMousedown.value;
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        (activeElement.isContentEditable ||
          activeElement.nodeName.toUpperCase() === "TEXTAREA" ||
          activeElement.nodeName.toUpperCase() === "INPUT")
      ) {
        selectedMode.value = selectedModeEnum.EDITABLE;
      } else {
        selectedMode.value = selectedModeEnum.READONLY;
      }
      showMainCard.value = true;
    }
  } else {
    showMainCard.value = false;
  }
});

function handleMainCardClose() {
  showMainCard.value = false;
}

const handleSettings = () => {
  const data: IPCMessageType = {
    topic: IPCTopicEnum.COMMUNICATION,
    type: CommunicationMessageTypeEnum.OPEN_OPTIONS_PAGE,
    message: "Open options page",
  };
  consoleLog(LogLevelEnum.DEBUG, data);
  chrome.runtime.sendMessage(data, () => {});
};

const handleStartChat = () => {
  chatDialog.setChatDialogVisible(true);
};

function showFeatures() {
  clearTimeout(showFeaturesTimeout);
  featureVisible.value = true;
}

function hideFeatures() {
  showFeaturesTimeout = setTimeout(() => {
    featureVisible.value = false;
  }, 3000);
}

onMounted(async () => {
  await userSettings.initialize();
});
</script>

<style scoped>
.cremind-features {
  position: fixed;
  right: 8px;
  bottom: 160px;
  z-index: 1000000000;
}

.settings {
  position: absolute;
  right: 52px;
  bottom: 6px;
  opacity: 0.7;
  color: rgb(140, 140, 140);
}
.settings:hover {
  font-weight: bold;
  opacity: 1;
}

.button-chatting {
  position: absolute;
  right: 40px;
  bottom: 40px;
  opacity: 0.7;
  color: rgb(140, 140, 140);
}
.button-chatting:hover {
  font-weight: bold;
  opacity: 1;
}

.apps {
  position: absolute;
  right: 10px;
  bottom: 55px;
  opacity: 0.7;
  color: rgb(140, 140, 140);
}
.apps:hover {
  font-weight: bold;
  opacity: 1;
}
</style>

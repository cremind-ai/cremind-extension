<template>
  <div v-show="logoShow">
    <div v-if="currentVisibleManager" class="app-cremind-features">
      <ElTooltip content="Ctrl+Shift+Z: hide me" placement="bottom">
        <LoadImg
          :filename="'CreMind-logo-white-128.png'"
          :width="45"
          @mouseover="showFeatures"
          @mouseout="hideFeatures"
        />
      </ElTooltip>

      <div
        v-if="featureVisible"
        @mouseover="showFeatures"
        @mouseout="hideFeatures"
      >
        <ElTooltip content="Settings" placement="bottom">
          <div class="app-settings">
            <Icon
              icon="solar:settings-line-duotone"
              :style="{ fontSize: '30px' }"
              @click="handleSettings"
            />
          </div>
        </ElTooltip>
        <ElTooltip content="Start Chat" placement="top">
          <div class="app-button-chatting">
            <Icon
              icon="fluent:chat-12-filled"
              :style="{ fontSize: '30px' }"
              @click="handleStartChat"
            />
          </div>
        </ElTooltip>
        <ElTooltip content="Apps" placement="top">
          <div class="app-apps">
            <Icon
              icon="icon-park-twotone:more-app"
              :style="{ fontSize: '25px' }"
              @click="handleApps"
            />
          </div>
        </ElTooltip>
      </div>
    </div>
    <PopupMenu
      :selectedText="selectedText"
      :top="top"
      :left="left"
      :show="showPopupMenu"
      :selectedMode="selectedMode"
      @close="handlePopupMenuClose"
    />
    <ChatDialog />
    <Apps v-model="appVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { ElTooltip } from "element-plus";
import { PopupMenu } from "@/components";
import { ChatDialog } from "@/components";
import { Apps } from "@/components";
import { LoadImg } from "@/components";
import { SystemVariableParser } from "@/lib";
import {
  CommunicationMessageTypeEnum,
  IPCMessageType,
  IPCTopicEnum,
  selectedModeEnum,
} from "@/types";
import { consoleLog, detectOperatingSystem, LogLevelEnum } from "@/utils";
import { useUserSettingsStore } from "@/store/user_settings";
import { useChatDialogStore } from "@/store/chat_dialog";
import {
  useVisibleManagerStore,
  VisibleManagerTypeEnum,
} from "@/store/visible_manager";
import { OperatingSystemEnum } from "@/constants";

const userSettings = useUserSettingsStore();
const chatDialog = useChatDialogStore();
const visibleManager = useVisibleManagerStore();

const logoShow = ref(true);
const selectedText = ref("");
const mousedownSelectedText = ref(false);
const top = ref("");
const left = ref("");
const topMousedown = ref("");
const leftMousedown = ref("");
const showPopupMenu = ref(false);
const selectedMode: Ref<selectedModeEnum> = ref(
  selectedModeEnum.EDITABLE_CONTEXT_MENU
);
const featureVisible = ref(false);
const appVisible = ref(false);
const isDark = ref(userSettings.getIsDark);
const currentVisibleManager = computed(() => {
  return visibleManager.getVisible(VisibleManagerTypeEnum.LOGO);
});
const visibleStates = computed(() => visibleManager.getVisibles);
let showFeaturesTimeout: any;

watch(
  () => userSettings.getIsDark,
  (value) => {
    isDark.value = value;
  }
);

function checkVisibleState(): boolean {
  return Object.keys(visibleStates.value).every((key) => {
    if (key === VisibleManagerTypeEnum.LOGO) {
      return visibleStates.value[key] === true;
    } else {
      return visibleStates.value[key] === false;
    }
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (!showPopupMenu.value) {
    if (checkVisibleState() === false) {
      return;
    }
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
    showPopupMenu.value = true;
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
  if (selection!.rangeCount <= 0) {
    return;
  }
  var range = selection!.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const activeElement = document.activeElement as HTMLElement;
  if (selectionText && !mousedownSelectedText.value && !showPopupMenu.value) {
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
    if (checkVisibleState() === true) {
      showPopupMenu.value = true;
    }
  }
});

document.addEventListener("keydown", function (event: KeyboardEvent) {
  if (
    (event.ctrlKey &&
      event.shiftKey &&
      event.key === "z" &&
      detectOperatingSystem() !== OperatingSystemEnum.MACOS) ||
    (event.metaKey &&
      event.shiftKey &&
      event.key === "z" &&
      detectOperatingSystem() === OperatingSystemEnum.MACOS)
  ) {
    if (checkVisibleState() === true) {
      if (logoShow.value) {
        logoShow.value = false;
      } else {
        logoShow.value = true;
      }
    }
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event: KeyboardEvent) {
  const pressedKey = event.key;
  const selectionText = window.getSelection()?.toString().trim();
  if (pressedKey === "Shift" || pressedKey === "Meta") {
    if (selectionText && !showPopupMenu.value) {
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
      if (checkVisibleState() === true) {
        showPopupMenu.value = true;
      }
    }
  }
});

function handlePopupMenuClose() {
  showPopupMenu.value = false;
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

const handleApps = () => {
  if (appVisible.value) {
    appVisible.value = false;
  } else {
    appVisible.value = true;
  }
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
  visibleManager.register(VisibleManagerTypeEnum.LOGO);
  visibleManager.resetShow();
  await userSettings.initialize();
});
</script>

<style scoped></style>

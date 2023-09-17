<template>
  <div v-if="isSidebar === SidebarMode.SIDEBAR">
    <PopupMenu
      v-for="(popupMenuVariable, index) in popupMenuVariables"
      :key="index"
      :index="index"
      :selectedText="popupMenuVariable.selectedText"
      :top="popupMenuVariable.top"
      :left="popupMenuVariable.left"
      :show="popupMenuVariable.show"
      :featureMode="popupMenuVariable.featureMode"
      :active-element="popupMenuVariable.activeElement"
      :sidebar="isSidebar"
      v-model:is-streaming="isStreaming"
      @feature-click="handlePopupMenuFeatureClick"
      @close="handlePopupMenuClose"
      @new-chat="newSelectionChat"
      @data="handlePopupMenuDataEvent"
      @complete="handlePopupMenuCompleteEvent"
      @error="handlePopupMenuErrorEvent"
    />
    <div v-if="!appSidebarEnable" class="app-cremind-features">
      <ElTooltip :hide-after="0" :content="hideMeLabel" placement="bottom">
        <LoadImg :filename="'CreMind-logo-white-128.png'" :width="20" />
      </ElTooltip>
    </div>
    <div v-show="appSidebarEnable">
      <div class="app-sidebar">
        <ElCard class="app-sidebar-card">
          <div class="app-settings-sidebar">
            <ElTooltip :hide-after="0" content="Settings" placement="bottom">
              <Icon
                icon="solar:settings-line-duotone"
                :style="{ fontSize: '30px' }"
                @click="handleSettings"
              />
            </ElTooltip>
          </div>
          <ElMenu
            mode="horizontal"
            :default-active="activeIndexMenu"
            :ellipsis="false"
            @select="handleSelectMenu"
          >
            <ElMenuItem index="0">Chatting</ElMenuItem>
            <ElMenuItem index="1">Quick Features</ElMenuItem>
            <ElMenuItem index="2">Apps</ElMenuItem>
          </ElMenu>
          <div
            v-show="activeIndexMenu === SidebarMenu.CHAT"
            class="app-sidebar-child-full"
          >
            <ChatBox
              ref="chatBoxRef"
              v-model:is-streaming="isStreaming"
              v-model:conversation-context="conversationContext"
              :is-send="isSendChatBox"
              :prompt="chatPrompt"
              v-model:chats="chats"
              @complete="handleChatBoxCompleteEvent"
              @error="handleChatBoxErrorEvent"
            ></ChatBox>
          </div>

          <div
            v-show="activeIndexMenu === SidebarMenu.QUICK"
            class="app-sidebar-child-full"
          >
            <Chat
              ref="selectionChatRef"
              :chats="selectionChats"
              @new-chat="newSelectionChat"
              v-model:blockSend="isStreaming"
            />
          </div>

          <div
            v-show="activeIndexMenu === SidebarMenu.APPS"
            class="app-sidebar-child-full"
          >
            <ElTooltip
              :hide-after="0"
              content="Larger display as popup"
              placement="bottom"
            >
              <ElButton
                class="apps-maximize-icon"
                type="success"
                plain
                @click="handleAppsMaximize"
                size="small"
                circle
              >
                <Icon
                  icon="fluent:window-new-20-regular"
                  :style="{ fontSize: '20px' }"
                />
              </ElButton>
            </ElTooltip>

            <AppsDialog
              ref="appsDialogRef"
              :dialog="appsMode"
              v-model="appsVisible"
              v-model:is-streaming="isStreaming"
              v-model:conversation-id="appsConversationId"
              @close="handleAppClose"
            />
          </div>
        </ElCard>
      </div>
    </div>
  </div>
  <div v-else-if="isSidebar === SidebarMode.WINDOWS">
    <div v-show="appEnable">
      <div v-show="appMenuVisible" class="app-cremind-features">
        <ElTooltip :hide-after="0" :content="hideMeLabel" placement="bottom">
          <LoadImg
            :filename="'CreMind-logo-white-128.png'"
            :width="45"
            @mouseover="showFeatures"
            @mouseout="hideFeatures"
          />
        </ElTooltip>

        <div
          v-show="featureVisible"
          @mouseover="showFeatures"
          @mouseout="hideFeatures"
        >
          <ElTooltip :hide-after="0" content="Settings" placement="bottom">
            <div class="app-settings">
              <Icon
                icon="solar:settings-line-duotone"
                :style="{ fontSize: '30px' }"
                @click="handleSettings"
              />
            </div>
          </ElTooltip>
          <ElTooltip :hide-after="0" content="Start Chat" placement="top">
            <div class="app-button-chatting">
              <Icon
                icon="fluent:chat-12-filled"
                :style="{ fontSize: '30px' }"
                @click="handleStartChat"
              />
            </div>
          </ElTooltip>
          <ElTooltip :hide-after="0" content="Apps" placement="top">
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
        v-for="(popupMenuVariable, index) in popupMenuVariables"
        :key="index"
        :index="index"
        :selectedText="popupMenuVariable.selectedText"
        :top="popupMenuVariable.top"
        :left="popupMenuVariable.left"
        :show="true"
        :featureMode="popupMenuVariable.featureMode"
        :active-element="popupMenuVariable.activeElement"
        :sidebar="isSidebar"
        v-model:is-streaming="isStreaming"
        @close="handlePopupMenuClose"
        @new-chat="newSelectionChat"
        @data="handlePopupMenuDataEvent"
        @complete="handlePopupMenuCompleteEvent"
        @error="handlePopupMenuErrorEvent"
      />
      <ChatDialog
        ref="chatDialogRef"
        :show="chatVisible"
        v-model:is-streaming="isStreaming"
        v-model:conversation-context="conversationContext"
        :prompt="chatPrompt"
        :chats="chats"
        @close="handleChatDialogClose"
      />
      <AppsDialog
        ref="appsDialogRef"
        v-model="appsVisible"
        v-model:conversation-id="appsConversationId"
        :dialog="true"
        v-model:is-streaming="isStreaming"
        @close="handleAppClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ComputedRef,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  Ref,
  ref,
  watch,
} from "vue";
import { Icon } from "@iconify/vue";
import { ElTooltip } from "element-plus";
import { ElMenu } from "element-plus";
import { ElCard } from "element-plus";
import { ElMenuItem } from "element-plus";
import { FullScreen } from "@element-plus/icons-vue";
import { PopupMenu } from "@/components";
import { ChatDialog } from "@/components";
import { AppsDialog } from "@/components";
import { LoadImg } from "@/components";
import { SystemVariableParser } from "@/lib";
import {
  CommunicationMessageTypeEnum,
  IPCMessageType,
  IPCTopicEnum,
  featureModeEnum,
} from "@/types";
import { consoleLog, detectOperatingSystem, LogLevelEnum } from "@/utils";
import { useUserSettingsStore } from "@/store/user_settings";
import { ConversationRoleEnum, OperatingSystemEnum } from "@/constants";
import { ChatBox } from "@/components";
import { SidebarMode } from "@/types/ui";
import {
  ConversationContextType,
  ConversationMessageType,
} from "@/types/conversation";
import { Chat } from "@/components/Chat";
import { getJsonFeatures } from "@/lib/common";
import { LLM } from "@/lib/llm";

enum SidebarMenu {
  CHAT = "0",
  QUICK = "1",
  APPS = "2",
}

type PopupMenuVariableType = {
  show: boolean;
  selectedText: string;
  top: string;
  left: string;
  featureMode: featureModeEnum;
  activeElement: HTMLInputElement | HTMLElement;
};

const userSettings = useUserSettingsStore();

const appMenuVisible = ref(true);
const appSidebarEnable = ref(false);
const appEnable = ref(true);
const selectedText = ref("");
const top = ref("");
const left = ref("");
const topMousedown = ref("");
const leftMousedown = ref("");
const showPopupMenu = ref(false);
const featureMode: Ref<featureModeEnum> = ref(
  featureModeEnum.EDITABLE_CONTEXT_MENU
);
const featureVisible = ref(false);
const chatVisible = ref(false);
const appsVisible = ref(false);
const isDark = computed(() => userSettings.getIsDark);
const isSidebar = ref(SidebarMode.NONE);
const hideMeLabel = computed(() => {
  let ctrlKey = "Ctrl";
  if (detectOperatingSystem() === OperatingSystemEnum.MACOS) {
    ctrlKey = "Cmd";
  }
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    return `${ctrlKey}+Shift+Z: show sidebar`;
  } else if (isSidebar.value === SidebarMode.WINDOWS) {
    return `${ctrlKey}+Shift+Z: hide me`;
  }
});

const isStreaming = ref(false);
const activeIndexMenu = ref(SidebarMenu.CHAT);
const activeElement = ref<HTMLInputElement | HTMLElement>();
const selectionChats: Ref<ConversationMessageType[]> = ref([]);
let chats: ConversationMessageType[] = reactive([]);
const selectionChatRef = ref<ComponentRef<typeof Chat>>();
const appsDialogRef = ref<ComponentRef<typeof AppsDialog>>();
const chatDialogRef = ref<ComponentRef<typeof ChatDialog>>();

const isSendChatBox = ref(false);
const chatPrompt = ref("");
const appsMode = ref(false);

const appSidebarRef: Ref<HTMLDivElement> = ref(null as any);

let popupMenuVariables: PopupMenuVariableType[] = reactive([]);

let conversationContext: ConversationContextType = reactive({
  conversationId: null,
  messageId: null,
  childMessageId: null,
  contextIds: [],
  endTurn: true,
  saveConversation: false,
  currentPrompt: null,
});

const chatBoxRef = ref<ComponentRef<typeof ChatBox>>();
const aiProvider = computed(() => userSettings.getAiProvider);
const appsConversationId: Ref<string> = ref("");

let showFeaturesTimeout: any;
let popupMenuDataResponse: string = "";
let shadowClick = false;
let shadowInsidePrevState = false;

var prevStartOffsetSelection: number | null = null;
var prevEndOffseSelection: number | null = null;

const llm = new LLM();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (
    !isStreaming.value &&
    ((isSidebar.value === SidebarMode.WINDOWS && appMenuVisible.value) ||
      (isSidebar.value === SidebarMode.SIDEBAR && !shadowInsidePrevState))
  ) {
    activeElement.value = document.activeElement as HTMLElement;
    if (
      activeElement &&
      (activeElement.value.isContentEditable ||
        activeElement.value.nodeName.toUpperCase() === "TEXTAREA" ||
        activeElement.value.nodeName.toUpperCase() === "INPUT")
    ) {
      selectedText.value = window.getSelection()!.toString().trim();
      featureMode.value = featureModeEnum.EDITABLE_CONTEXT_MENU;
    } else {
      selectedText.value = "";
      featureMode.value = featureModeEnum.READONLY_CONTEXT_MENU;
    }
    top.value = topMousedown.value;
    left.value = leftMousedown.value;
    handleShowPopupMenu();
  }
});

document.addEventListener("mousedown", function (event: MouseEvent) {
  topMousedown.value = `${event.clientY + window.scrollY}px`;
  leftMousedown.value = `${event.clientX + window.scrollX}px`;
});

document.addEventListener("mouseup", function (event: MouseEvent) {
  setTimeout(function () {
    if (!shadowClick) {
      shadowInsidePrevState = false;
    }
    if (
      !isStreaming.value &&
      ((isSidebar.value === SidebarMode.WINDOWS && appMenuVisible.value) ||
        (isSidebar.value === SidebarMode.SIDEBAR && !shadowInsidePrevState))
    ) {
      var selection = window.getSelection();
      let selectionText = selection!.toString().trim();
      if (selection!.rangeCount <= 0) {
        return;
      }
      var range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      activeElement.value = document.activeElement as HTMLElement;
      if (
        selectionText !== "" &&
        !(
          prevStartOffsetSelection === selection!.anchorOffset &&
          prevEndOffseSelection === selection!.focusOffset
        )
      ) {
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
          activeElement.value &&
          (activeElement.value.isContentEditable ||
            activeElement.value.nodeName.toUpperCase() === "TEXTAREA" ||
            activeElement.value.nodeName.toUpperCase() === "INPUT")
        ) {
          featureMode.value = featureModeEnum.EDITABLE;
        } else {
          featureMode.value = featureModeEnum.READONLY;
        }
        handleShowPopupMenu();
        prevStartOffsetSelection = selection!.anchorOffset;
        prevEndOffseSelection = selection!.focusOffset;
      } else if (selectionText === "") {
        prevStartOffsetSelection = null;
        prevEndOffseSelection = null;
      }
    }
    shadowClick = false;
  }, 0);
});

const handleMouseupShadow = (event: Event) => {
  shadowClick = true;
  if (
    appSidebarRef.value &&
    appSidebarRef.value.contains(event.target as Node)
  ) {
    shadowInsidePrevState = true;
  }
};

document.addEventListener("keydown", function (event: KeyboardEvent) {
  if (
    (event.ctrlKey &&
      event.shiftKey &&
      event.key.toLowerCase() === "z" &&
      detectOperatingSystem() !== OperatingSystemEnum.MACOS) ||
    (event.metaKey &&
      event.shiftKey &&
      event.key.toLowerCase() === "z" &&
      detectOperatingSystem() === OperatingSystemEnum.MACOS)
  ) {
    if (isSidebar.value === SidebarMode.SIDEBAR) {
      if (appSidebarEnable.value) {
        appSidebarEnable.value = false;
        userSettings.$state.sidebar = SidebarMode.NONE;
      } else {
        appSidebarEnable.value = true;
        userSettings.$state.sidebar = SidebarMode.SIDEBAR;
      }
      userSettings.applySidebarClass();
    } else if (
      appMenuVisible.value &&
      isSidebar.value === SidebarMode.WINDOWS
    ) {
      if (appEnable.value) {
        appEnable.value = false;
      } else {
        appEnable.value = true;
      }
    }
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event: KeyboardEvent) {
  if (
    !isStreaming.value &&
    ((isSidebar.value === SidebarMode.WINDOWS && appMenuVisible.value) ||
      (isSidebar.value === SidebarMode.SIDEBAR && !shadowInsidePrevState))
  ) {
    const pressedKey = event.key;
    if (pressedKey === "Shift" || pressedKey === "Meta") {
      var selection = window.getSelection();
      let selectionText = selection!.toString().trim();
      if (selection!.rangeCount <= 0) {
        return;
      }
      var range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      activeElement.value = document.activeElement as HTMLElement;
      if (
        selectionText !== "" &&
        !(
          prevStartOffsetSelection === selection!.anchorOffset &&
          prevEndOffseSelection === selection!.focusOffset
        )
      ) {
        selectedText.value = selectionText;
        SystemVariableParser.getInstance().setSelectedText(selectionText);
        top.value = topMousedown.value;
        left.value = leftMousedown.value;
        activeElement.value = document.activeElement as HTMLElement;
        if (
          activeElement.value &&
          (activeElement.value.isContentEditable ||
            activeElement.value.nodeName.toUpperCase() === "TEXTAREA" ||
            activeElement.value.nodeName.toUpperCase() === "INPUT")
        ) {
          featureMode.value = featureModeEnum.EDITABLE;
        } else {
          featureMode.value = featureModeEnum.READONLY;
        }
        handleShowPopupMenu();
        prevStartOffsetSelection = selection!.anchorOffset;
        prevEndOffseSelection = selection!.focusOffset;
      } else if (selectionText === "") {
        prevStartOffsetSelection = null;
        prevEndOffseSelection = null;
      }
    }
  }
});

function handleShowPopupMenu() {
  if (isSidebar.value === SidebarMode.SIDEBAR && selectedText.value !== "") {
    activeIndexMenu.value = SidebarMenu.QUICK;
  } else if (isSidebar.value === SidebarMode.WINDOWS) {
    appMenuVisible.value = false;
  }
  popupMenuVariables.push({
    show: true,
    selectedText: selectedText.value,
    top: top.value,
    left: left.value,
    featureMode: featureMode.value,
    activeElement: activeElement.value!,
  });
  while (popupMenuVariables.length > 1) {
    popupMenuVariables.pop();
  }
}

const handleStartChat = () => {
  chatVisible.value = true;
  appMenuVisible.value = false;
};

const handleApps = () => {
  appsVisible.value = true;
  appMenuVisible.value = false;
};

function handlePopupMenuClose(index: number) {
  appMenuVisible.value = true;
  if (isStreaming.value) {
    popupMenuVariables[index].show = false;
  } else {
    popupMenuVariables.splice(index, 1);
  }
  prevStartOffsetSelection = null;
  prevEndOffseSelection = null;
}

function handlePopupMenuFeatureClick() {
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    appSidebarEnable.value = true;
    userSettings.$state.sidebar = SidebarMode.SIDEBAR;
    userSettings.applySidebarClass();
    activeIndexMenu.value = SidebarMenu.QUICK;
    selectionChats.value.push({
      role: ConversationRoleEnum.USER,
      text: selectedText.value,
    });
    selectionChats.value.push({
      role: ConversationRoleEnum.ASSISTANT,
      text: "",
    });
    popupMenuDataResponse = "";
    nextTick(() => {
      selectionChatRef.value?.scrollToBottom();
    });
  }
}

function handleChatDialogClose() {
  chatVisible.value = false;
  appMenuVisible.value = true;
}

function handleAppClose() {
  nextTick(() => {
    if (isSidebar.value === SidebarMode.SIDEBAR) {
      appsMode.value = false;
      appsVisible.value = true;
    } else if (isSidebar.value === SidebarMode.WINDOWS) {
      appsVisible.value = false;
      appMenuVisible.value = true;
    }
  });
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

function showFeatures() {
  clearTimeout(showFeaturesTimeout);
  featureVisible.value = true;
}

function hideFeatures() {
  showFeaturesTimeout = setTimeout(() => {
    featureVisible.value = false;
  }, 3000);
}

const handleSelectMenu = async (key: string, keyPath: string[]) => {
  const sidebarMenuEnum: SidebarMenu = key as SidebarMenu;
  activeIndexMenu.value = sidebarMenuEnum;
};

const handlePopupMenuDataEvent = (data: string, index: number) => {
  selectionChats.value[selectionChats.value.length - 1] = {
    role: ConversationRoleEnum.ASSISTANT,
    text: data,
  };
  nextTick(() => {
    selectionChatRef.value?.scrollToBottom();
  });
};

const handlePopupMenuCompleteEvent = (data: string, index: number) => {
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    popupMenuVariables.splice(index, 1);
  }
  selectionChats.value[selectionChats.value.length - 1] = {
    role: ConversationRoleEnum.ASSISTANT,
    text: data,
  };

  nextTick(() => {
    selectionChatRef.value?.scrollToBottom();
  });
  popupMenuDataResponse = data;
  isStreaming.value = false;
};

const handlePopupMenuErrorEvent = (index: number) => {
  popupMenuVariables.splice(index, 1);
  isStreaming.value = false;
};

const handleChatBoxCompleteEvent = () => {
  isStreaming.value = false;
  isSendChatBox.value = false;
};

const handleChatBoxErrorEvent = () => {
  isStreaming.value = false;
  isSendChatBox.value = false;
};

const handleAppsComplete = () => {};

const newSelectionChat = (value: string) => {
  isStreaming.value = true;
  let text = "";
  text += SystemVariableParser.getInstance().getSelectedText() + "\n";
  text += "\\-\\-\\-\n";
  text += popupMenuDataResponse + "\n";
  text += "\\-\\-\\-\n";
  text += value + "\n";
  chatPrompt.value = text;
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    activeIndexMenu.value = SidebarMenu.CHAT;
    nextTick(() => {
      isSendChatBox.value = true;
    });
  } else if (isSidebar.value === SidebarMode.WINDOWS) {
    appMenuVisible.value = false;
    chatVisible.value = true;
  }
};

const handleAppsMaximize = () => {
  appsMode.value = true;
  appsVisible.value = true;
};

async function handleBeforeUnload(event: Event) {
  appsConversationId.value = await appsDialogRef.value!.stopGenerating();
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    conversationContext.conversationId =
      await chatBoxRef.value!.stopGenerating();

    nextTick(() => {
      appsDialogRef.value!.close();
      chatBoxRef.value!.close();
    });
  } else if (isSidebar.value === SidebarMode.WINDOWS) {
    conversationContext.conversationId =
      await chatDialogRef.value!.stopGenerating();

    nextTick(() => {
      appsDialogRef.value!.close();
      chatDialogRef.value!.close();
    });
  }

  if (
    !conversationContext.saveConversation &&
    conversationContext.conversationId
  ) {
    llm.deleteConversation({
      aiProvider: aiProvider.value,
      conversationId: conversationContext.conversationId!,
    });
  }
}

onMounted(async () => {
  window.addEventListener("beforeunload", handleBeforeUnload);
  getJsonFeatures(false);
  await userSettings.initialize(false);
  isSidebar.value = userSettings.getSidebar;
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    appsVisible.value = true;
    if (appSidebarEnable.value) {
      userSettings.$state.sidebar = SidebarMode.SIDEBAR;
    } else {
      userSettings.$state.sidebar = SidebarMode.NONE;
    }
    userSettings.applySidebarClass();

    nextTick(() => {
      const shadowHost = document.querySelector("cremind-app-extension");
      if (shadowHost) {
        const shadowRoot = shadowHost.shadowRoot;
        if (shadowRoot) {
          appSidebarRef.value = shadowRoot.querySelector(
            ".app-sidebar"
          ) as HTMLDivElement;
          shadowRoot.addEventListener("mouseup", handleMouseupShadow);
        }
      }
    });
  } else if (isSidebar.value === SidebarMode.WINDOWS) {
  }
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<style scoped></style>

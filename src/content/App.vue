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
      v-model:drawer-show="drawerShow"
      @feature-click="handlePopupMenuFeatureClick"
      @unmounted="handlePopupMenuUnmounted"
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
          <ElMenu
            class="app-sidebar-menu app-icon-color"
            mode="horizontal"
            :default-active="activeIndexMenu"
            :ellipsis="false"
            :collapse="false"
            @select="handleSelectMenu"
          >
            <ElTooltip :hide-after="0" content="Chatting" placement="bottom">
              <ElMenuItem index="0">
                <Icon
                  icon="fluent:chat-12-filled"
                  :style="{ fontSize: '25px' }"
                />
              </ElMenuItem>
            </ElTooltip>
            <ElTooltip
              :hide-after="0"
              content="Selected text"
              placement="bottom"
            >
              <ElMenuItem index="1">
                <Icon
                  icon="fluent:textbox-16-filled"
                  :style="{ fontSize: '25px' }"
                />
              </ElMenuItem>
            </ElTooltip>
            <ElTooltip :hide-after="0" content="Prompts" placement="bottom">
              <ElMenuItem index="2">
                <Icon
                  icon="ic:outline-auto-awesome"
                  :style="{ fontSize: '25px' }"
                />
              </ElMenuItem>
            </ElTooltip>
            <ElTooltip :hide-after="0" content="Upload" placement="bottom">
              <ElMenuItem index="3">
                <Icon
                  icon="ic:twotone-cloud-upload"
                  :style="{ fontSize: '25px' }"
                />
              </ElMenuItem>
            </ElTooltip>
            <ElTooltip :hide-after="0" content="Settings" placement="bottom">
              <ElMenuItem index="4">
                <Icon
                  icon="solar:settings-line-duotone"
                  :style="{ fontSize: '25px' }"
                />
              </ElMenuItem>
            </ElTooltip>
          </ElMenu>
          <div
            v-show="activeIndexMenu === SidebarMenuEnum.CHAT"
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
            v-show="activeIndexMenu === SidebarMenuEnum.TEXT"
            class="app-sidebar-child-full"
          >
            <div class="custom-popover-outer">
              <ElButton
                class="app-sidebar-text-manual-insert"
                type="success"
                plain
                @click="handleManualInsert"
                size="small"
                circle
              >
                <ElTooltip
                  :hide-after="0"
                  content="Manual insert text"
                  placement="bottom"
                >
                  <Icon
                    icon="ic:round-post-add"
                    :style="{ fontSize: '16px' }"
                  />
                </ElTooltip>
              </ElButton>
              <div v-show="manualInsertVisible" class="custom-popover">
                <ManualMenu
                  v-model:is-streaming="isStreaming"
                  v-model:drawer-show="drawerShow"
                  :show-ouput="false"
                  @feature-click="handleManualInsertFeatureClick"
                  @close="handleManualInsertClose"
                  @data="handleManualInsertDataEvent"
                  @complete="handleManualInsertCompleteEvent"
                  @error="handleManualInsertErrorEvent"
                >
                </ManualMenu>
              </div>
            </div>
            <Chat
              ref="selectionChatRef"
              :chats="selectionChats"
              @new-chat="newSelectionChat"
              v-model:blockSend="isStreaming"
            />
          </div>
          <div
            v-show="activeIndexMenu === SidebarMenuEnum.PROMPT"
            class="app-sidebar-child-full"
          >
            <PromptApp
              :activation="menuActivationState[SidebarMenuEnum.PROMPT]"
              v-model:is-streaming="isStreaming"
              v-model:drawer-show="drawerShow"
              @new-chat="newPromptChat"
              @close="handlePromptAppClose"
            ></PromptApp>
          </div>
          <div
            v-show="activeIndexMenu === SidebarMenuEnum.UPLOAD"
            class="app-sidebar-child-full"
          >
            <ElTooltip
              :hide-after="0"
              content="Larger display as popup"
              placement="bottom"
            >
              <ElButton
                class="app-maximize-icon"
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

            <UploadDialog
              ref="appsDialogRef"
              :dialog="appsMode"
              v-model="appsVisible"
              v-model:is-streaming="isStreaming"
              v-model:drawer-show="drawerShow"
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
          <ElTooltip :hide-after="0" content="Settings" placement="top">
            <div class="app-settings">
              <Icon
                icon="solar:settings-line-duotone"
                :style="{ fontSize: '30px' }"
                @click="handleSettings"
              />
            </div>
          </ElTooltip>

          <ElTooltip :hide-after="0" content="Start chat" placement="left">
            <div class="app-button-chatting">
              <Icon
                icon="fluent:chat-12-filled"
                :style="{ fontSize: '30px' }"
                @click="handleStartChat"
              />
            </div>
          </ElTooltip>
          <ElTooltip :hide-after="0" content="Prompts" placement="bottom">
            <div class="app-prompts">
              <Icon
                icon="ic:outline-auto-awesome"
                :style="{ fontSize: '25px' }"
                @click="handlePrompt"
              />
            </div>
          </ElTooltip>
          <ElTooltip :hide-after="0" content="Upload" placement="bottom">
            <div class="app-apps">
              <Icon
                icon="ic:twotone-cloud-upload"
                :style="{ fontSize: '25px' }"
                @click="handleApps"
              />
            </div>
          </ElTooltip>
        </div>
        <ElPopover
          :hide-after="0"
          placement="top"
          :visible="manualInsertVisible"
          :width="manualInsertWidth"
        >
          <template #reference>
            <div
              v-show="featureVisible || manualInsertVisible"
              class="manual-insert-text"
            >
              <ElTooltip
                :hide-after="0"
                content="Manual insert text"
                placement="top"
              >
                <Icon
                  icon="ic:round-post-add"
                  :style="{ fontSize: '30px' }"
                  @click="handleManualInsertText"
              /></ElTooltip>
            </div>
          </template>
          <div @mouseover="manualInsertVisible = true">
            <ManualMenu
              v-model:is-streaming="isStreaming"
              v-model:drawer-show="drawerShow"
              :show-ouput="true"
              @feature-click="handleManualInsertFeatureClick"
              @close="handleManualInsertClose"
              @data="handleManualInsertDataEvent"
              @complete="handleManualInsertCompleteEvent"
              @error="handleManualInsertErrorEvent"
              @new-chat="handleManualInsertNewChatEvent"
            >
            </ManualMenu>
          </div>
        </ElPopover>
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
        v-model:drawer-show="drawerShow"
        @close="handlePopupMenuClose"
        @unmounted="handlePopupMenuUnmounted"
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
      <PromptAppDialog
        :show="promptVisible"
        v-model:is-streaming="isStreaming"
        v-model:drawer-show="drawerShow"
        @close="handlePromptDialogClose"
        @new-chat="newPromptChat"
      />
      <UploadDialog
        ref="appsDialogRef"
        v-model="appsVisible"
        v-model:conversation-id="appsConversationId"
        v-model:drawer-show="drawerShow"
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
import { ElPopover } from "element-plus";
import { FullScreen } from "@element-plus/icons-vue";
import { PopupMenu } from "@/components";
import { ChatDialog } from "@/components";
import { UploadDialog } from "@/components";
import { LoadImg } from "@/components";
import { PromptAppDialog } from "@/components";
import { PromptApp } from "@/components";
import { SystemVariableParser } from "@/lib";
import {
  CommunicationMessageTypeEnum,
  IPCMessageType,
  IPCTopicEnum,
  FeatureModeEnum,
} from "@/types";
import { consoleLog, detectOperatingSystem, LogLevelEnum } from "@/utils";
import { useUserSettingsStore } from "@/store/user_settings";
import {
  ConversationRoleEnum,
  MAXIMUM_FEATURES_SIZE_DEFAULT,
  OperatingSystemEnum,
} from "@/constants";
import { ChatBox } from "@/components";
import { ManualMenu } from "@/components";
import { SidebarMode } from "@/types/ui";
import {
  ConversationContextType,
  ConversationMessageType,
} from "@/types/conversation";
import { Chat } from "@/components/Chat";
import { getJsonFeatures } from "@/lib/common";
import { LLM } from "@/lib/llm";
import { FeatureSchema } from "@/lib/features";
import { SidebarMenuEnum } from "@/constants/ui";

type PopupMenuVariableType = {
  show: boolean;
  selectedText: string;
  top: string;
  left: string;
  featureMode: FeatureModeEnum;
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
const drawerShow = ref(false);
const featureMode: Ref<FeatureModeEnum> = ref(FeatureModeEnum.READONLY);
const featureVisible = ref(false);
const chatVisible = ref(false);
const promptVisible = ref(false);
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
const activeIndexMenu = ref(SidebarMenuEnum.CHAT);
let menuActivationState = reactive({
  [SidebarMenuEnum.CHAT]: true,
  [SidebarMenuEnum.TEXT]: false,
  [SidebarMenuEnum.PROMPT]: false,
  [SidebarMenuEnum.UPLOAD]: false,
  [SidebarMenuEnum.SETTINGS]: false,
});
const activeElement = ref<HTMLInputElement | HTMLElement>();
const selectionChats: Ref<ConversationMessageType[]> = ref([]);
let chats: ConversationMessageType[] = reactive([]);
const selectionChatRef = ref<ComponentRef<typeof Chat>>();
const appsDialogRef = ref<ComponentRef<typeof UploadDialog>>();
const chatDialogRef = ref<ComponentRef<typeof ChatDialog>>();

const isSendChatBox = ref(false);
const chatPrompt = ref("");
const appsMode = ref(false);
const manualInsertVisible = ref(false);
const manualInsertWidth = ref(400);

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
let dataResponse: string = "";
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
      ((isSidebar.value === SidebarMode.WINDOWS &&
        appMenuVisible.value &&
        !manualInsertVisible.value) ||
        (isSidebar.value === SidebarMode.SIDEBAR &&
          !shadowInsidePrevState &&
          !drawerShow.value))
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
          featureMode.value = FeatureModeEnum.EDITABLE;
        } else {
          featureMode.value = FeatureModeEnum.READONLY;
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
        userSettings.applySidebarClass(true, SidebarMode.NONE);
      } else {
        appSidebarEnable.value = true;
        userSettings.setSidebar(SidebarMode.SIDEBAR);
        userSettings.applySidebarClass(false, null);
      }
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
    ((isSidebar.value === SidebarMode.WINDOWS &&
      appMenuVisible.value &&
      !manualInsertVisible.value) ||
      (isSidebar.value === SidebarMode.SIDEBAR &&
        !shadowInsidePrevState &&
        !drawerShow.value))
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
          featureMode.value = FeatureModeEnum.EDITABLE;
        } else {
          featureMode.value = FeatureModeEnum.READONLY;
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
    activeIndexMenu.value = SidebarMenuEnum.TEXT;
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

const handlePrompt = () => {
  promptVisible.value = true;
  appMenuVisible.value = false;
};

const handleApps = () => {
  appsVisible.value = true;
  appMenuVisible.value = false;
};

function handleChatDialogClose() {
  chatPrompt.value = "";
  chatVisible.value = false;
  appMenuVisible.value = true;
}

function handlePromptDialogClose() {
  chatPrompt.value = "";
  promptVisible.value = false;
  appMenuVisible.value = true;
}

function handlePromptAppClose() {
  chatPrompt.value = "";
}

const newPromptChat = (value: string) => {
  nextTick(() => {
    isStreaming.value = true;
    chatPrompt.value = value;
    if (isSidebar.value === SidebarMode.SIDEBAR) {
      activeIndexMenu.value = SidebarMenuEnum.CHAT;
      nextTick(() => {
        isSendChatBox.value = true;
      });
    } else if (isSidebar.value === SidebarMode.WINDOWS) {
      nextTick(() => {
        appMenuVisible.value = false;
        chatVisible.value = true;
      });
    }
  });
};

function handleAppClose() {
  chatPrompt.value = "";
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
  const sidebarMenuEnum: SidebarMenuEnum = key as SidebarMenuEnum;
  activeIndexMenu.value = sidebarMenuEnum;
  for (const key in menuActivationState) {
    if (key == activeIndexMenu.value) {
      menuActivationState[key as SidebarMenuEnum] = true;
    } else {
      menuActivationState[key as SidebarMenuEnum] = false;
    }
  }
  if (activeIndexMenu.value === SidebarMenuEnum.SETTINGS) {
    handleSettings();
  }
};

const handleManualInsertText = () => {
  if (isSidebar.value === SidebarMode.WINDOWS) {
    if (manualInsertVisible.value) {
      manualInsertVisible.value = false;
    } else {
      manualInsertVisible.value = true;
    }
  }
};

const handleManualInsertClose = () => {
  chatPrompt.value = "";
  manualInsertVisible.value = false;
};

function handleManualInsertFeatureClick(insertedText: string) {
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    appSidebarEnable.value = true;
    userSettings.setSidebar(SidebarMode.SIDEBAR);
    userSettings.applySidebarClass(false, null);
    activeIndexMenu.value = SidebarMenuEnum.TEXT;
    selectionChats.value.push({
      role: ConversationRoleEnum.USER,
      text: insertedText,
    });
    selectionChats.value.push({
      role: ConversationRoleEnum.ASSISTANT,
      text: "",
    });
    nextTick(() => {
      selectionChatRef.value?.scrollToBottom();
      if (!drawerShow.value) {
        manualInsertVisible.value = false;
      }
    });
  }
}

const handleManualInsertDataEvent = (data: string) => {
  selectionChats.value[selectionChats.value.length - 1] = {
    role: ConversationRoleEnum.ASSISTANT,
    text: data,
  };
  nextTick(() => {
    selectionChatRef.value?.scrollToBottom();
  });
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    manualInsertVisible.value = false;
  }
};

const handleManualInsertCompleteEvent = (data: string) => {
  dataResponse = data;
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    selectionChats.value[selectionChats.value.length - 1] = {
      role: ConversationRoleEnum.ASSISTANT,
      text: data,
    };

    nextTick(() => {
      selectionChatRef.value?.scrollToBottom();
    });
    manualInsertVisible.value = false;
  } else if (isSidebar.value === SidebarMode.WINDOWS) {
  }
  isStreaming.value = false;
};

const handleManualInsertErrorEvent = () => {
  isStreaming.value = false;
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    manualInsertVisible.value = false;
  }
};

const handleManualInsertNewChatEvent = (text: string) => {
  nextTick(() => {
    isStreaming.value = true;
    chatPrompt.value = text;
    if (isSidebar.value === SidebarMode.SIDEBAR) {
      activeIndexMenu.value = SidebarMenuEnum.CHAT;
      nextTick(() => {
        isSendChatBox.value = true;
      });
    } else if (isSidebar.value === SidebarMode.WINDOWS) {
      appMenuVisible.value = false;
      chatVisible.value = true;
    }
  });
};

function handlePopupMenuClose(index: number) {
  chatPrompt.value = "";
  appMenuVisible.value = true;
  if (isStreaming.value) {
    popupMenuVariables[index].show = false;
  } else {
    popupMenuVariables.splice(index, 1);
  }
  prevStartOffsetSelection = null;
  prevEndOffseSelection = null;
}

function handlePopupMenuUnmounted() {
  drawerShow.value = false;
}

function handlePopupMenuFeatureClick() {
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    appSidebarEnable.value = true;
    userSettings.setSidebar(SidebarMode.SIDEBAR);
    userSettings.applySidebarClass(false, null);
    activeIndexMenu.value = SidebarMenuEnum.TEXT;
    selectionChats.value.push({
      role: ConversationRoleEnum.USER,
      text: selectedText.value,
    });
    selectionChats.value.push({
      role: ConversationRoleEnum.ASSISTANT,
      text: "",
    });
    dataResponse = "";
    chatPrompt.value = "";
    nextTick(() => {
      selectionChatRef.value?.scrollToBottom();
    });
  }
}

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
  dataResponse = data;
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
  text += "\\=\\=\\=\n";
  text += dataResponse + "\n";
  text += "\\=\\=\\=\n";
  text += value + "\n";
  chatPrompt.value = text;
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    activeIndexMenu.value = SidebarMenuEnum.CHAT;
    nextTick(() => {
      isSendChatBox.value = true;
    });
  } else if (isSidebar.value === SidebarMode.WINDOWS) {
    appMenuVisible.value = false;
    chatVisible.value = true;
  }
};

const handleManualInsert = () => {
  manualInsertVisible.value = true;
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
  getJsonFeatures(false, 1, MAXIMUM_FEATURES_SIZE_DEFAULT, null, null);
  await userSettings.initialize(false);
  isSidebar.value = userSettings.getSidebar;
  if (isSidebar.value === SidebarMode.SIDEBAR) {
    manualInsertWidth.value = 400;
    appsVisible.value = true;
    if (appSidebarEnable.value) {
      userSettings.setSidebar(SidebarMode.SIDEBAR);
      userSettings.applySidebarClass(false, null);
    } else {
      userSettings.applySidebarClass(true, SidebarMode.NONE);
    }

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
    manualInsertWidth.value = 700;
  }
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<style scoped></style>

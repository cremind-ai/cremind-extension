<template>
  <div v-if="iconMaximizeShow" class="popup-card-maximize">
    <ElTooltip
      content="Go back to the CreMind Extension dialog"
      placement="top"
    >
      <ElButton
        type="success"
        plain
        :icon="FullScreen"
        @click="handleGoback"
        circle
      ></ElButton>
    </ElTooltip>
  </div>
  <ElPopover
    class="popup-card-popover"
    style="word-break: normal"
    placement="bottom"
    :visible="popoverVisible && currentVisibleManager"
    :width="width"
    popper-style="background-image: linear-gradient(140deg, rgba(234, 222, 219, 0.4) 0%, rgba(255, 78, 199, 0.4) 50%, rgba(191, 214, 65, 0.4) 75%); border-radius: 14px;"
  >
    <template #reference>
      <div
        class="popup-card-cremind-icon-bar"
        :style="{ zIndex: optionBarZIndex, top, left }"
      >
        <LoadImg
          class="popup-card-cremind-logo"
          :filename="'CreMind-logo-white-64.png'"
          :width="20"
          v-show="logoShow"
          @click="handleClickLogo"
        ></LoadImg>
        <div class="popup-card-option-bar" v-show="vitualOptionBarShow">
          <div v-if="selectedMode === selectedModeEnum.EDITABLE">
            <ElButtonGroup>
              <ElTooltip
                content="Click the icon for a tidy display of the 'Options Bar'. Change mode now 👇."
                placement="top"
              >
                <ElButton
                  size="small"
                  class="popup-card-menu-bar-button"
                  style="padding: 2px"
                  type="success"
                  plain
                >
                  <ElSwitch
                    size="small"
                    style="--el-switch-on-color: #13ce66"
                    v-model="tidyDisplayOptionBarMode"
                  />
                </ElButton>
              </ElTooltip>
              <template
                v-for="(feature, index) in filteredFeatureList"
                :key="index"
              >
                <ElTooltip
                  :content="feature.EDITABLE?.title"
                  placement="top"
                  v-if="enabledFeatureStates[convertIndexToOriginal(index)]"
                >
                  <ElButton
                    size="small"
                    class="popup-card-menu-bar-button"
                    type="success"
                    plain
                    @click="
                      handleFeatureClick(
                        feature,
                        index,
                        selectedModeEnum.EDITABLE
                      )
                    "
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
                  </ElButton>
                </ElTooltip>
              </template>
              <ElDropdown @command="handleCommand">
                <ElButton
                  size="small"
                  class="popup-card-menu-bar-button"
                  type="success"
                  plain
                >
                  <Icon
                    icon="material-symbols:more-vert"
                    :style="{ fontSize: '20px' }"
                  />
                </ElButton>
                <template #dropdown>
                  <ElDropdownMenu>
                    <template
                      v-for="(option, index) in moreOptions"
                      :key="index"
                    >
                      <ElDropdownItem :command="option.label">
                        <ElTooltip :content="option.label" placement="auto">
                          <Icon
                            :icon="option.icon.content || ''"
                            :style="{ fontSize: option.icon.fontSize }"
                            v-if="option.icon.type === 'icon'"
                          />
                          <div
                            v-if="option.icon.type === 'svg'"
                            v-html="option.icon.content"
                          ></div>
                        </ElTooltip>
                      </ElDropdownItem>
                    </template>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </ElButtonGroup>
          </div>
          <div v-else-if="selectedMode === selectedModeEnum.READONLY">
            <ElButtonGroup>
              <ElTooltip
                content="Click the icon for a tidy display of the 'Options Bar'. Change mode now 👇."
                placement="top"
              >
                <ElButton
                  size="small"
                  class="popup-card-menu-bar-button"
                  style="padding: 1px"
                  type="success"
                  plain
                >
                  <ElSwitch
                    size="small"
                    style="--el-switch-on-color: #13ce66"
                    v-model="tidyDisplayOptionBarMode"
                  />
                </ElButton>
              </ElTooltip>

              <template
                v-for="(feature, index) in filteredFeatureList"
                :key="index"
              >
                <ElTooltip
                  :content="feature.READONLY?.title"
                  placement="top"
                  v-if="enabledFeatureStates[convertIndexToOriginal(index)]"
                >
                  <ElButton
                    size="small"
                    class="popup-card-menu-bar-button"
                    type="success"
                    plain
                    @click="
                      handleFeatureClick(
                        feature,
                        index,
                        selectedModeEnum.READONLY
                      )
                    "
                  >
                    <Icon
                      :icon="feature.READONLY?.Icon.content || ''"
                      :style="{ fontSize: feature.READONLY?.Icon.fontSize }"
                      v-if="feature.READONLY?.Icon.type === 'icon'"
                    />
                    <span
                      v-if="feature.READONLY?.Icon.type === 'svg'"
                      v-html="feature.READONLY?.Icon.content"
                      :style="{
                        fontSize: feature.READONLY?.Icon.fontSize,
                        width: feature.READONLY?.Icon.width,
                        height: feature.READONLY?.Icon.height,
                      }"
                    ></span>
                  </ElButton>
                </ElTooltip>
              </template>
              <ElDropdown @command="handleCommand">
                <ElButton
                  size="small"
                  class="popup-card-menu-bar-button"
                  type="success"
                  plain
                >
                  <Icon
                    icon="material-symbols:more-vert"
                    :style="{ fontSize: '20px' }"
                  />
                </ElButton>
                <template #dropdown>
                  <ElDropdownMenu>
                    <template
                      v-for="(option, index) in moreOptions"
                      :key="index"
                    >
                      <ElDropdownItem :command="option.label">
                        <ElTooltip :content="option.label" placement="auto">
                          <Icon
                            :icon="option.icon.content || ''"
                            :style="{ fontSize: option.icon.fontSize }"
                            v-if="option.icon.type === 'icon'"
                          />
                          <div
                            v-if="option.icon.type === 'svg'"
                            v-html="option.icon.content"
                          ></div>
                        </ElTooltip>
                      </ElDropdownItem>
                    </template>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </ElButtonGroup>
          </div>
          <div
            v-else-if="selectedMode === selectedModeEnum.READONLY_CONTEXT_MENU"
          >
            <ElButtonGroup>
              <template
                v-for="(feature, index) in filteredFeatureList"
                :key="index"
              >
                <ElTooltip
                  :content="feature.READONLY_CONTEXT_MENU?.title"
                  placement="top"
                  v-if="enabledFeatureStates[convertIndexToOriginal(index)]"
                >
                  <ElButton
                    size="small"
                    class="popup-card-menu-bar-button"
                    type="success"
                    plain
                    @click="
                      handleFeatureClick(
                        feature,
                        index,
                        selectedModeEnum.READONLY_CONTEXT_MENU
                      )
                    "
                  >
                    <Icon
                      :icon="feature.READONLY_CONTEXT_MENU?.Icon.content || ''"
                      :style="{
                        fontSize: feature.READONLY_CONTEXT_MENU?.Icon.fontSize,
                      }"
                      v-if="feature.READONLY_CONTEXT_MENU?.Icon.type === 'icon'"
                    />
                    <span
                      v-if="feature.READONLY_CONTEXT_MENU?.Icon.type === 'svg'"
                      v-html="feature.READONLY_CONTEXT_MENU?.Icon.content"
                      :style="{
                        fontSize: feature.READONLY_CONTEXT_MENU?.Icon.fontSize,
                        width: feature.READONLY_CONTEXT_MENU?.Icon.width,
                        height: feature.READONLY_CONTEXT_MENU?.Icon.height,
                      }"
                    ></span>
                  </ElButton>
                </ElTooltip>
              </template>
              <ElDropdown @command="handleCommand">
                <ElButton
                  size="small"
                  class="popup-card-menu-bar-button"
                  type="success"
                  plain
                >
                  <Icon
                    icon="material-symbols:more-vert"
                    :style="{ fontSize: '20px' }"
                  />
                </ElButton>
                <template #dropdown>
                  <ElDropdownMenu>
                    <template
                      v-for="(option, index) in moreOptions"
                      :key="index"
                    >
                      <ElDropdownItem :command="option.label">
                        <ElTooltip :content="option.label" placement="auto">
                          <Icon
                            :icon="option.icon.content || ''"
                            :style="{ fontSize: option.icon.fontSize }"
                            v-if="option.icon.type === 'icon'"
                          />
                          <div
                            v-if="option.icon.type === 'svg'"
                            v-html="option.icon.content"
                          ></div>
                        </ElTooltip>
                      </ElDropdownItem>
                    </template>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </ElButtonGroup>
          </div>
          <div
            v-else-if="selectedMode === selectedModeEnum.EDITABLE_CONTEXT_MENU"
          >
            <ElButtonGroup>
              <template
                v-for="(feature, index) in filteredFeatureList"
                :key="index"
              >
                <ElTooltip
                  :content="feature.EDITABLE_CONTEXT_MENU?.title"
                  placement="top"
                  v-if="enabledFeatureStates[convertIndexToOriginal(index)]"
                >
                  <ElButton
                    size="small"
                    class="popup-card-menu-bar-button"
                    type="success"
                    plain
                    @click.stop="
                      handleFeatureClick(
                        feature,
                        index,
                        selectedModeEnum.EDITABLE_CONTEXT_MENU
                      )
                    "
                  >
                    <Icon
                      :icon="feature.EDITABLE_CONTEXT_MENU?.Icon.content || ''"
                      :style="{
                        fontSize: feature.EDITABLE_CONTEXT_MENU?.Icon.fontSize,
                      }"
                      v-if="feature.EDITABLE_CONTEXT_MENU?.Icon.type === 'icon'"
                    />
                    <span
                      v-if="feature.EDITABLE_CONTEXT_MENU?.Icon.type === 'svg'"
                      v-html="feature.EDITABLE_CONTEXT_MENU?.Icon.content"
                      :style="{
                        fontSize: feature.EDITABLE_CONTEXT_MENU?.Icon.fontSize,
                        width: feature.EDITABLE_CONTEXT_MENU?.Icon.width,
                        height: feature.EDITABLE_CONTEXT_MENU?.Icon.height,
                      }"
                    ></span>
                  </ElButton>
                </ElTooltip>
              </template>
              <ElDropdown @command="handleCommand">
                <ElButton
                  size="small"
                  class="popup-card-menu-bar-button"
                  type="success"
                  plain
                >
                  <Icon
                    icon="material-symbols:more-vert"
                    :style="{ fontSize: '20px' }"
                  />
                </ElButton>
                <template #dropdown>
                  <ElDropdownMenu>
                    <template
                      v-for="(option, index) in moreOptions"
                      :key="index"
                    >
                      <ElDropdownItem :command="option.label">
                        <ElTooltip :content="option.label" placement="auto">
                          <Icon
                            :icon="option.icon.content || ''"
                            :style="{ fontSize: option.icon.fontSize }"
                            v-if="option.icon.type === 'icon'"
                          />
                          <div
                            v-if="option.icon.type === 'svg'"
                            v-html="option.icon.content"
                          ></div>
                        </ElTooltip>
                      </ElDropdownItem>
                    </template>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </ElButtonGroup>
          </div>
        </div>
      </div>
    </template>
    <div style="display: flex; justify-content: flex-end; margin-right: 50px">
      <ElButtonGroup>
        <ElTooltip content="Regenerate response" placement="top">
          <ElButton plain @click="handleRegenerate">
            <Icon icon="ion:reload" :style="{ fontSize: '20px' }" />
          </ElButton>
        </ElTooltip>
        <ElTooltip content="Copy to clipboard" placement="top">
          <ElButton plain @click="handleCopyToClipboard">
            <Icon
              icon="solar:copy-line-duotone"
              :style="{ fontSize: '20px' }"
            />
          </ElButton>
        </ElTooltip>
      </ElButtonGroup>
    </div>
    <ElButton
      class="popup-card-minimize-icon"
      type="warning"
      plain
      :icon="SemiSelect"
      @click="handleMinimize"
      size="small"
      circle
    ></ElButton>
    <ElButton
      class="popup-card-close-icon"
      type="danger"
      plain
      :icon="Close"
      @click="handleClose"
      size="small"
      circle
    ></ElButton>
    <ElScrollbar ref="scrollContentRef" :maxHeight="contentMaxHeight">
      <div
        ref="contentRef"
        class="popup-card-scroll-content"
        :style="{
          padding: '20px',
        }"
      >
        <div v-if="selectedMode !== selectedModeEnum.EDITABLE_CONTEXT_MENU">
          <!-- <pre style="white-space: pre-wrap; word-wrap: break-word">{{
            selectedText
          }}</pre>
          <ElDivider></ElDivider> -->
        </div>
        <div v-html="markedRender(outputContent)"></div>
      </div>
    </ElScrollbar>
    <ChatAction @new-chat="newChat" v-model:blockSend="blockSend" />
  </ElPopover>
  <ElDrawer
    v-model="drawer"
    title="Initialize your prompt"
    direction="ltr"
    :before-close="handleCloseDrawer"
  >
    <ElForm :model="formDataVariableSchema" label-position="top">
      <ElFormItem
        v-for="(schema, key) in currentFeature.variableSchema"
        :key="key"
        :label="schema.description"
      >
        <template v-if="schema.systemOptions">
          <ElSelect
            v-model="formDataVariableSchema[key]"
            placeholder="Select"
            filterable
          >
            <ElOption
              v-for="option in SystemOptions[`${schema.systemOptions}`]"
              :key="option"
              :label="option"
              :value="option"
            ></ElOption>
          </ElSelect>
        </template>
        <template v-else-if="schema.options">
          <ElSelect
            v-model="formDataVariableSchema[key]"
            placeholder="Select"
            filterable
          >
            <ElOption
              v-for="option in schema.options"
              :key="option"
              :label="option"
              :value="option"
            ></ElOption>
          </ElSelect>
        </template>
        <template v-else>
          <ElInput
            v-model="formDataVariableSchema[key]"
            autosize
            type="textarea"
            placeholder="Enter text"
          ></ElInput>
        </template>
      </ElFormItem>
      <br />
      <ElFormItem>
        <ElButton @click="handleAutoFillSample">Auto Fill Sample</ElButton>
        <ElButton @click="handleStartGenerateResponse">Run</ElButton>
      </ElFormItem>
    </ElForm>
  </ElDrawer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, Ref, computed } from "vue";
import { ElPopover } from "element-plus";
import { ElButton } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElScrollbar } from "element-plus";
import { ElMessageBox } from "element-plus";
import { ElDrawer } from "element-plus";
import { ElInput } from "element-plus";
import { ElSelect } from "element-plus";
import { ElOption } from "element-plus";
import { ElForm } from "element-plus";
import { ElFormItem } from "element-plus";
import { ElDivider } from "element-plus";
import { ElMessage } from "element-plus";
import { ElTooltip } from "element-plus";
import { ElDropdown } from "element-plus";
import { ElDropdownMenu } from "element-plus";
import { ElDropdownItem } from "element-plus";
import { ElSwitch } from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { SemiSelect } from "@element-plus/icons-vue";
import { FullScreen } from "@element-plus/icons-vue";
import { Icon } from "@iconify/vue";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { LoadImg } from ".";
import {
  CommunicationMessageTypeEnum,
  IPCTopicEnum,
  IPCMessageType,
  selectedModeEnum,
} from "@/types";
import { FeatureType } from "@/lib/features";
import { ChainBuilder } from "@/lib/chain/chain_builder";
import { CWException } from "@/types/exception";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { FeatureSchema, Icon as IconType } from "@/lib/features";
import { Status } from "@/constants/status";
import { SystemOptions } from "@/constants/system_variables";
import { useChatDialogStore } from "@/store/chat_dialog";
import { ChatAction } from "./Chat";
import { consoleLog, LogLevelEnum } from "@/utils";
import { useUserSettingsStore } from "@/store/user_settings";
import { ConversationModeEnum } from "@/types/conversation";
import {
  useVisibleManagerStore,
  VisibleManagerTypeEnum,
} from "@/store/visible_manager";
import { LLM } from "@/lib/llm";
// import { shadowRoot } from "@/content";

const visibleManager = useVisibleManagerStore();

const props = defineProps({
  selectedText: {
    type: String,
    required: true,
  },
  top: {
    type: String,
    required: true,
  },
  left: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
  selectedMode: {
    type: String,
    required: true,
    validator: (value: string) =>
      Object.values(selectedModeEnum).includes(value as selectedModeEnum),
  },
});

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);
marked.use({ silent: true, breaks: true });

const emits = defineEmits(["close"]);

const chatDialog = useChatDialogStore();
const userSettings = useUserSettingsStore();

const optionBarShow = ref(props.show);
const tidyDisplayOptionBarMode = ref(userSettings.getTidyDisplayOptionBarMode);
const vitualOptionBarShow = ref(false);
const combineOptionBarShowVisible = computed(() => {
  return optionBarShow.value && currentVisibleManager.value;
});
const popoverVisible = ref(false);
const optionBarZIndex = ref(1000000000);
const optionBarRef: Ref<HTMLDivElement> = ref(null as any);
const logoRef: Ref<HTMLDivElement> = ref(null as any);
const popoverRef: Ref<HTMLDivElement> = ref(null as any);
const contentRef: Ref<HTMLDivElement> = ref(null as any);
const originalActiveElement: Ref<any> = ref(null as any);
const width = ref(0);
const selectedMode: Ref<selectedModeEnum> = ref(
  props.selectedMode as selectedModeEnum
);
const outputContent = ref("");
const scrollContentRef = ref<InstanceType<typeof ElScrollbar>>();
const contentMaxHeight = ref(500);
const clickOutsideConfirm = ref(false);
const clickOutsideFocus = ref(true);
const isStreaming = ref(false);
const iconMaximizeShow = ref(false);
const logoShow = ref(false);
const drawer = ref(false);
const formDataVariableSchema = ref<{ [key: string]: string }>({});
const enabledFeatureStates: Ref<boolean[]> = ref([]);
const currentFeature: Ref<FeatureType> = ref({} as FeatureType);
const currentFeatureId: Ref<string> = ref("");
const currentFeatureMode: Ref<selectedModeEnum> = ref(
  selectedModeEnum.READONLY_CONTEXT_MENU
);
const featureList: Ref<FeatureSchema[]> = ref([]);

const filteredFeatureList = computed(() => {
  const _filteredFeatureList = featureList.value.filter((feature) => {
    const { READONLY, EDITABLE, READONLY_CONTEXT_MENU, EDITABLE_CONTEXT_MENU } =
      feature;

    switch (selectedMode.value) {
      case selectedModeEnum.READONLY:
        return READONLY !== undefined;
      case selectedModeEnum.EDITABLE:
        return EDITABLE !== undefined;
      case selectedModeEnum.READONLY_CONTEXT_MENU:
        return READONLY_CONTEXT_MENU !== undefined;
      case selectedModeEnum.EDITABLE_CONTEXT_MENU:
        return EDITABLE_CONTEXT_MENU !== undefined;
      default:
        return false;
    }
  });
  return _filteredFeatureList;
});

enum OptionCommandType {
  SETTINGS = "Settings",
}

const moreOptions: Ref<
  {
    label: string;
    icon: IconType;
  }[]
> = ref([
  {
    label: OptionCommandType.SETTINGS,
    icon: {
      content: "solar:settings-line-duotone",
      fontSize: "16px",
      type: "icon",
    },
  },
]);

const blockSend = ref(false);
const isDark = ref(userSettings.getIsDark);

const llm = new LLM();

let startSelectionIndex: number = 0;
let endSelectionIndex: number = 0;
let prevOptionBarShow = false;
let shadowClickInside = false;

const currentVisibleManager = computed(() => {
  return visibleManager.getVisible(VisibleManagerTypeEnum.POPUP_CARD);
});

let conversationId: string | null = null;
let messageId: string | null = null;

watch(
  () => props.show,
  (newValue) => {
    if (newValue === true) {
      if (
        (!iconMaximizeShow.value && !tidyDisplayOptionBarMode.value) ||
        (!logoShow.value && tidyDisplayOptionBarMode.value)
      ) {
        visibleManager.takeVisible(VisibleManagerTypeEnum.POPUP_CARD);
        if (!tidyDisplayOptionBarMode.value) {
          optionBarShow.value = newValue;
        }
        logoShow.value = newValue;
        iconMaximizeShow.value = false;
        consoleLog(LogLevelEnum.DEBUG, "===> Show menu");
        const activeElement = document.activeElement as HTMLElement;
        if (
          selectedMode.value === selectedModeEnum.EDITABLE_CONTEXT_MENU ||
          selectedMode.value === selectedModeEnum.EDITABLE
        ) {
          originalActiveElement.value = activeElement as HTMLInputElement;
        }

        if (
          originalActiveElement.value &&
          originalActiveElement.value!.value !== undefined &&
          originalActiveElement.value!.value !== null
        ) {
          startSelectionIndex = originalActiveElement.value!.selectionStart;
          endSelectionIndex = originalActiveElement.value!.selectionEnd;
        } else if (
          originalActiveElement.value &&
          ((originalActiveElement.value!.innerText !== undefined &&
            originalActiveElement.value!.innerText !== null) ||
            (originalActiveElement.value!.textContent !== undefined &&
              originalActiveElement.value!.textContent !== null))
        ) {
          var selection = window.getSelection();
          let selectedText = selection!.toString().trim();
          var range = selection!.getRangeAt(0).cloneRange();
          range.selectNodeContents(activeElement);
          range.setEnd(
            selection!.getRangeAt(0).startContainer,
            selection!.getRangeAt(0).startOffset
          );
          startSelectionIndex = range.toString().length;
          endSelectionIndex = startSelectionIndex + selectedText.length;
        }
      }
    } else if (newValue === false && !popoverVisible.value) {
      close();
    }
  }
);

watch(
  () => props.selectedText,
  (newValue) => {
    width.value = 0;
  }
);

watch(
  () => outputContent.value,
  (newValue) => {
    const _width = contentRef.value.offsetWidth;
    if (_width > 700) {
      width.value = 700;
    }
  }
);

watch(
  () => props.selectedMode,
  (newValue) => {
    selectedMode.value = newValue as selectedModeEnum;
  }
);

watch(
  () => drawer.value,
  (newValue) => {
    if (newValue) {
      optionBarZIndex.value = 2000;
    } else {
      optionBarZIndex.value = 1000000000;
    }
  }
);

watch(
  () => userSettings.getIsDark,
  (value) => {
    isDark.value = value;
  }
);

watch(
  () => userSettings.getTidyDisplayOptionBarMode,
  (value) => {
    tidyDisplayOptionBarMode.value = value;
  }
);

watch(
  () => tidyDisplayOptionBarMode.value,
  (value) => {
    userSettings.setTidyDisplayOptionBarMode(value);
  }
);

watch(
  () => combineOptionBarShowVisible.value,
  (value) => {
    if (value) {
      vitualOptionBarShow.value = true;
    } else {
      setTimeout(() => {
        vitualOptionBarShow.value = false;
      }, 10);
    }
  }
);

const markedRender = (text: string) => {
  return marked.parse(text);
};

const scrollToBottom = () => {
  scrollContentRef.value!.setScrollTop(contentRef.value!.clientHeight);
};

const writeOriginalActiveElementValue = (text: string) => {
  if (
    originalActiveElement.value!.value !== undefined &&
    originalActiveElement.value!.value !== null
  ) {
    originalActiveElement.value!.value = text;
  } else if (
    originalActiveElement.value!.innerText !== undefined &&
    originalActiveElement.value!.innerText !== null
  ) {
    originalActiveElement.value!.innerText = text;
  } else if (
    originalActiveElement.value!.textContent !== undefined &&
    originalActiveElement.value!.textContent !== null
  ) {
    originalActiveElement.value!.textContent = text;
  }
};

const readOriginalActiveElementValue = (): string => {
  if (
    originalActiveElement.value!.value !== undefined &&
    originalActiveElement.value!.value !== null
  ) {
    return originalActiveElement.value!.value;
  } else if (
    originalActiveElement.value!.innerText !== undefined &&
    originalActiveElement.value!.innerText !== null
  ) {
    return originalActiveElement.value!.innerText;
  } else if (
    originalActiveElement.value!.textContent !== undefined &&
    originalActiveElement.value!.textContent !== null
  ) {
    return originalActiveElement.value!.textContent;
  }
  return "";
};

const startGenerateResponse = async (variables: { [key: string]: string }) => {
  const chainBuilder = new ChainBuilder(llm, currentFeature.value.Chains);
  consoleLog(LogLevelEnum.DEBUG, variables);
  for (const key in variables) {
    const storageKey = `FEATURE:${currentFeatureId.value}:${currentFeatureMode.value}:variable:${key}`;
    consoleLog(LogLevelEnum.DEBUG, storageKey);
    await ChromeStorage.getInstance().set(storageKey, variables[key]);
  }
  await chainBuilder.buildChains(variables);
  const result = await chainBuilder.executeChains(true, {
    conversationId: conversationId,
    messageId: messageId,
    conversationMode: ConversationModeEnum.NORMAL,
    deleteConversation: true,
  });

  let startPart: string;
  let endPart: string;
  if (
    (currentFeatureMode.value === selectedModeEnum.EDITABLE_CONTEXT_MENU ||
      currentFeatureMode.value === selectedModeEnum.EDITABLE) &&
    currentFeature.value.WriteResponse &&
    currentFeature.value.WriteResponse === true
  ) {
    // Remove selected text
    let text = readOriginalActiveElementValue();
    startPart = text.slice(0, startSelectionIndex);
    endPart = text.slice(endSelectionIndex);
  }

  let responses = "";
  outputContent.value = "";
  result.on("data", (data: string) => {
    outputContent.value += data;
    if (
      (currentFeatureMode.value === selectedModeEnum.EDITABLE_CONTEXT_MENU ||
        currentFeatureMode.value === selectedModeEnum.EDITABLE) &&
      currentFeature.value.WriteResponse &&
      currentFeature.value.WriteResponse === true
    ) {
      responses += data;
      writeOriginalActiveElementValue(startPart + responses + endPart);
    }
    scrollToBottom();
  });
  result.on("complete", (data: any) => {
    consoleLog(LogLevelEnum.DEBUG, "=====>complete");
    outputContent.value += "\n";
    consoleLog(LogLevelEnum.DEBUG, `${data.message}`);
  });
  result.on("endOfChain", (data: any) => {
    consoleLog(LogLevelEnum.DEBUG, "=====>endOfChain");
    isStreaming.value = false;
    consoleLog(LogLevelEnum.DEBUG, `${data.message}`);
  });
  result.on("error", (error: CWException) => {
    isStreaming.value = false;
    consoleLog(LogLevelEnum.DEBUG, error);
    if (error.code === Status.CHATGPT_UNAUTHORIZED) {
      ElMessage.error(
        "ChatGPT still not logged in yet. Please login and try again. 👉 https://chat.openai.com/"
      );
    } else if (error.code === Status.IPC_RESPONSE_TIMEOUT) {
      // ElMessage.error(
      //   "ChatGPT is not responding. Please try again later or refresh the page. 👉 https://chat.openai.com/"
      // );
    } else if (error.code === Status.CHATGPT_RESPONSE_ERROR) {
      ElMessage.error(`ChatGPT: ${error.message}`);
    } else {
      ElMessage.error(error.message);
    }
  });
};

async function handleFeature(
  id: string,
  feature: FeatureType,
  type: selectedModeEnum
) {
  const variables: { [key: string]: string } = {};
  let checkShowDrawer: boolean = false;
  isStreaming.value = true;
  currentFeature.value = feature;
  currentFeatureId.value = id;
  currentFeatureMode.value = type;
  consoleLog(LogLevelEnum.DEBUG, id);
  consoleLog(LogLevelEnum.DEBUG, feature.variableSchema);

  formDataVariableSchema.value = {};
  for (const key in feature.variableSchema) {
    if (!feature.variableSchema[key].storage) {
      checkShowDrawer = true;
      continue;
    }
    const storageKey = `FEATURE:${id}:${type}:variable:${key}`;
    consoleLog(LogLevelEnum.DEBUG, storageKey);
    const value = await ChromeStorage.getInstance().get(storageKey);
    consoleLog(LogLevelEnum.DEBUG, value);
    if (!value) {
      checkShowDrawer = true;
      continue;
    }
    variables[key] = value;
    formDataVariableSchema.value[key] = value;
  }
  consoleLog(LogLevelEnum.DEBUG, "checkShowDrawer", checkShowDrawer);
  drawer.value = checkShowDrawer;

  if (!checkShowDrawer) {
    startGenerateResponse(variables);
  } else {
    clickOutsideFocus.value = false;
  }
}

function convertIndexToOriginal(indexInFiltered: number): number {
  const filteredFeature = filteredFeatureList.value[indexInFiltered];
  const idToFind = filteredFeature.id;

  for (let i = 0; i < featureList.value.length; i++) {
    if (featureList.value[i].id === idToFind) {
      return i;
    }
  }

  return -1;
}

async function handleFeatureClick(
  featureSchema: FeatureSchema,
  index: number,
  type: selectedModeEnum
) {
  const id: string = featureSchema.id;
  if (isStreaming.value) {
    ElMessageBox.alert(
      "You cannot switch feature because the response is being streamed",
      "Warning",
      {
        confirmButtonText: "OK",
      }
    );
    return;
  }
  outputContent.value = "";
  popoverVisible.value = true;
  handleFeature(id, featureSchema[type]!, type);
}

function close() {
  consoleLog(LogLevelEnum.DEBUG, "Close");
  popoverVisible.value = false;
  visibleManager.resetShow();
  optionBarShow.value = false;
  logoShow.value = false;
  emits("close");
}

function handleClose() {
  if (isStreaming.value) {
    clickOutsideConfirm.value = true;
    ElMessageBox.confirm(
      "The result is being streamed, do you want to exit?",
      "Warning",
      {
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    )
      .then(() => {
        close();
        clickOutsideConfirm.value = false;
      })
      .catch(() => {
        clickOutsideConfirm.value = false;
      });
  } else {
    close();
  }
}

const clickOutside = (event: Event) => {
  if (tidyDisplayOptionBarMode.value) {
    if (logoShow.value && !popoverVisible.value && !shadowClickInside) {
      close();
    }
  } else {
    if (logoShow.value && !popoverVisible.value && !shadowClickInside) {
      close();
    }
  }
  shadowClickInside = false;
};

const handleMousedownShadow = (event: Event) => {};

const handleMouseupShadow = (event: Event) => {
  if (
    (prevOptionBarShow && logoShow.value) ||
    (prevOptionBarShow && optionBarShow.value)
  ) {
    if (tidyDisplayOptionBarMode.value) {
      if (
        (logoRef.value && logoRef.value.contains(event.target as Node)) ||
        (optionBarRef.value &&
          optionBarRef.value.contains(event.target as Node))
      ) {
        shadowClickInside = true;
      } else {
        shadowClickInside = false;
      }
    } else {
      if (
        (logoRef.value && logoRef.value.contains(event.target as Node)) ||
        (optionBarRef.value &&
          optionBarRef.value.contains(event.target as Node))
      ) {
        shadowClickInside = true;
      } else {
        shadowClickInside = false;
      }
    }
  }
};

const handleMousedown = (event: MouseEvent) => {
  if (tidyDisplayOptionBarMode.value) {
    prevOptionBarShow = logoShow.value;
  } else {
    prevOptionBarShow = optionBarShow.value;
  }
};

const handleMouseup = (event: MouseEvent) => {
  if (
    (prevOptionBarShow && logoShow.value) ||
    (prevOptionBarShow && optionBarShow.value)
  ) {
    clickOutside(event);
  }
};

const handleKeyup = (event: KeyboardEvent) => {
  const pressedKey = event.key;
  console.log("handleKeyup", pressedKey);
  if (pressedKey !== "Shift" && pressedKey !== "Meta") {
    if (logoShow.value || optionBarShow.value) {
      clickOutside(event);
    }
  }
};

const handleAutoFillSample = () => {
  for (const key in currentFeature.value.variableSchema) {
    if (currentFeature.value.variableSchema[key].options) {
      formDataVariableSchema.value[key] = currentFeature.value.variableSchema[
        key
      ].options![
        currentFeature.value.variableSchema[key].sample as number
      ] as string;
    } else {
      formDataVariableSchema.value[key] = currentFeature.value.variableSchema[
        key
      ].sample as string;
    }
  }
};

const handleStartGenerateResponse = () => {
  clickOutsideFocus.value = true;
  drawer.value = false;
  startGenerateResponse(formDataVariableSchema.value);
};

const handleCloseDrawer = () => {
  clickOutsideFocus.value = true;
  drawer.value = false;
  isStreaming.value = false;
  close();
};

const handleClickLogo = () => {
  optionBarShow.value = true;
};

const newChat = (value: string) => {
  let text = "";
  text += props.selectedText + "\n";
  text += "\\-\\-\\-\n";
  text += outputContent.value + "\n";
  text += "\\-\\-\\-\n";
  text += value + "\n";
  close();
  chatDialog.setInitialPrompt(text);
  chatDialog.setChatDialogVisible(true);
};

const handleRegenerate = () => {
  clickOutsideFocus.value = true;
  drawer.value = false;
  consoleLog(LogLevelEnum.DEBUG, formDataVariableSchema.value);
  startGenerateResponse(formDataVariableSchema.value);
};

const handleCopyToClipboard = () => {
  consoleLog(LogLevelEnum.DEBUG, "handleCopyToClipboard");
  if (outputContent.value) {
    navigator.clipboard.writeText(outputContent.value);
  }
};

const handleMinimize = () => {
  iconMaximizeShow.value = true;
  popoverVisible.value = false;
  logoShow.value = false;
  optionBarShow.value = false;
  visibleManager.resetShow();
};

const handleGoback = () => {
  visibleManager.takeVisible(VisibleManagerTypeEnum.POPUP_CARD);
  iconMaximizeShow.value = false;
  optionBarShow.value = true;
  popoverVisible.value = true;
  logoShow.value = true;
};

const handleCommand = (command: OptionCommandType) => {
  switch (command) {
    case OptionCommandType.SETTINGS:
      const data: IPCMessageType = {
        topic: IPCTopicEnum.COMMUNICATION,
        type: CommunicationMessageTypeEnum.OPEN_OPTIONS_PAGE,
        message: "Open options page",
      };
      consoleLog(LogLevelEnum.DEBUG, data);
      chrome.runtime.sendMessage(data, () => {});
      break;
  }
};

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

onMounted(async () => {
  consoleLog(LogLevelEnum.DEBUG, "onMounted");
  document.addEventListener("mouseup", handleMouseup);
  document.addEventListener("mousedown", handleMousedown);
  document.addEventListener("keyup", handleKeyup);
  const shadowHost = document.querySelector("cremind-app-extension");
  if (shadowHost) {
    const shadowRoot = shadowHost.shadowRoot;
    if (shadowRoot) {
      visibleManager.register(VisibleManagerTypeEnum.POPUP_CARD);
      optionBarRef.value = shadowRoot.querySelector(
        ".popup-card-option-bar"
      ) as HTMLDivElement;
      popoverRef.value = shadowRoot.querySelector(
        ".popup-card-popover"
      ) as HTMLDivElement;
      logoRef.value = shadowRoot.querySelector(
        ".popup-card-cremind-logo"
      ) as HTMLDivElement;

      shadowRoot.addEventListener("mouseup", handleMouseupShadow);
      shadowRoot.addEventListener("mousedown", handleMousedownShadow);

      const data: IPCMessageType = {
        topic: IPCTopicEnum.COMMUNICATION,
        type: CommunicationMessageTypeEnum.GET_FEATURES,
        message: "Get JSON Features",
      };
      chrome.runtime.sendMessage(data, async (response) => {
        if (response.features) {
          featureList.value = response.features;
          enabledFeatureStates.value = await Promise.all(
            response.features.map((feature: any) =>
              getFeatureEnabledState(feature)
            )
          );
        } else {
          featureList.value = [];
        }
      });
    }
  }
});

onUnmounted(() => {
  consoleLog(LogLevelEnum.DEBUG, "onUnmounted");
  document.removeEventListener("mouseup", handleMouseup);
  document.removeEventListener("mousedown", handleMousedown);
  document.removeEventListener("keyup", handleKeyup);
  const shadowHost = document.querySelector("cremind-app-extension");
  if (shadowHost) {
    const shadowRoot = shadowHost.shadowRoot;
    if (shadowRoot) {
      shadowRoot.removeEventListener("mouseup", handleMouseupShadow);
      shadowRoot.removeEventListener("mousedown", handleMousedownShadow);
    }
  }
});
</script>

<style scoped>
@import "@/styles/components/PopupMenu.scss";
</style>

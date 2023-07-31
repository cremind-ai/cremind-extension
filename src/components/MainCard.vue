<template>
  <div v-if="logoIconShow" class="cword-icon" @click="handleLogoIcon">
    <LoadImg :filename="'cWord-logo-128.png'" :width="45" />
  </div>
  <ElPopover
    style="word-break: normal"
    placement="auto"
    :visible="popoverVisible"
    :width="width"
    popper-style="background-image: linear-gradient(140deg, rgba(234, 222, 219, 0.4) 0%, rgba(188, 112, 164, 0.4) 50%, rgba(191, 214, 65, 0.4) 75%);"
  >
    <template #reference>
      <div class="option-bar" :style="{ top, left }" v-show="optionBarShow">
        <LoadImg
          class="cword-icon-bar"
          :filename="'cWord-logo-64.png'"
          :width="20"
        />
        <div v-if="selectedMode === selectedModeEnum.EDITABLE">
          <ElButtonGroup>
            <template
              v-for="(feature, index) in filteredFeatureList"
              :key="index"
            >
              <ElTooltip
                :content="feature.EDITABLE?.label"
                placement="top"
                v-if="enabledFeatureStates[convertIndexToOriginal(index)]"
              >
                <ElButton
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
              <ElButton type="success" plain>
                <Icon
                  icon="material-symbols:more-vert"
                  :style="{ fontSize: '20px' }"
                />
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <template v-for="(option, index) in moreOptions" :key="index">
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
            <template
              v-for="(feature, index) in filteredFeatureList"
              :key="index"
            >
              <ElTooltip
                :content="feature.READONLY?.label"
                placement="top"
                v-if="enabledFeatureStates[convertIndexToOriginal(index)]"
              >
                <ElButton
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
              <ElButton type="success" plain>
                <Icon
                  icon="material-symbols:more-vert"
                  :style="{ fontSize: '20px' }"
                />
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <template v-for="(option, index) in moreOptions" :key="index">
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
        <div v-else-if="selectedMode === selectedModeEnum.EDITABLE_NO_CONTENT">
          <ElButtonGroup>
            <template
              v-for="(feature, index) in filteredFeatureList"
              :key="index"
            >
              <ElTooltip
                :content="feature.EDITABLE_NO_CONTENT?.label"
                placement="top"
                v-if="enabledFeatureStates[convertIndexToOriginal(index)]"
              >
                <ElButton
                  type="success"
                  plain
                  @click="
                    handleFeatureClick(
                      feature,
                      index,
                      selectedModeEnum.EDITABLE_NO_CONTENT
                    )
                  "
                >
                  <Icon
                    :icon="feature.EDITABLE_NO_CONTENT?.Icon.content || ''"
                    :style="{
                      fontSize: feature.EDITABLE_NO_CONTENT?.Icon.fontSize,
                    }"
                    v-if="feature.EDITABLE_NO_CONTENT?.Icon.type === 'icon'"
                  />
                  <span
                    v-if="feature.EDITABLE_NO_CONTENT?.Icon.type === 'svg'"
                    v-html="feature.EDITABLE_NO_CONTENT?.Icon.content"
                    :style="{
                      fontSize: feature.EDITABLE_NO_CONTENT?.Icon.fontSize,
                      width: feature.EDITABLE_NO_CONTENT?.Icon.width,
                      height: feature.EDITABLE_NO_CONTENT?.Icon.height,
                    }"
                  ></span>
                </ElButton>
              </ElTooltip>
            </template>
            <ElDropdown @command="handleCommand">
              <ElButton type="success" plain>
                <Icon
                  icon="material-symbols:more-vert"
                  :style="{ fontSize: '20px' }"
                />
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <template v-for="(option, index) in moreOptions" :key="index">
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
      class="minimize-icon"
      type="warning"
      plain
      :icon="SemiSelect"
      @click="handleMinimize"
      size="small"
      circle
    ></ElButton>
    <ElButton
      class="close-icon"
      type="danger"
      plain
      :icon="Close"
      @click="handleClose"
      size="small"
      circle
    ></ElButton>
    <ElScrollbar ref="scrollContentRef" :maxHeight="contentMaxHeight">
      <div ref="contentRef" style="padding: 20px">
        <div v-if="selectedMode !== selectedModeEnum.EDITABLE_NO_CONTENT">
          <pre style="white-space: pre-wrap; word-wrap: break-word">{{
            selectedText
          }}</pre>
          <ElDivider></ElDivider>
        </div>
        <div v-html="markedRender(outputContent)"></div>
      </div>
    </ElScrollbar>
    <ChatAction @new-chat="newChat" />
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
            placeholder="Enter text"
          ></ElInput>
        </template>
      </ElFormItem>
      <br />
      <ElFormItem>
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
import { Close } from "@element-plus/icons-vue";
import { SemiSelect } from "@element-plus/icons-vue";
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
} from "../types";
import { FeatureType } from "../lib/features";
import { ChainBuilder } from "../lib/chain/chain_builder";
import { CWException } from "../types/exception";
import { ChromeStorage } from "../hooks/chrome_storage";
import { FeatureSchema, Icon as IconType } from "../lib/features";
import { Status } from "../constants/status";
import { SystemOptions } from "../constants/system_variables";
import { useChatDialogStore } from "../store/chat_dialog";
import { ChatAction } from "./Chat";
import { consoleLog, LogLevelEnum } from "../utils";

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

const optionBarShow = ref(props.show);
const popoverVisible = ref(false);
const optionBarRef: Ref<HTMLDivElement> = ref(null as any);
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
const logoIconShow = ref(false);
const drawer = ref(false);
const formDataVariableSchema = ref<{ [key: string]: string }>({});
const enabledFeatureStates: Ref<boolean[]> = ref([]);
const currentFeature: Ref<FeatureType> = ref({} as FeatureType);
const currentFeatureId: Ref<string> = ref("");
const currentFeatureMode: Ref<selectedModeEnum> = ref(
  selectedModeEnum.EDITABLE_NO_CONTENT
);
const featureList: Ref<FeatureSchema[]> = ref([]);

const filteredFeatureList = computed(() => {
  const _filteredFeatureList = featureList.value.filter((feature) => {
    const { READONLY, EDITABLE, EDITABLE_NO_CONTENT } = feature;

    switch (selectedMode.value) {
      case selectedModeEnum.READONLY:
        return READONLY !== undefined;
      case selectedModeEnum.EDITABLE:
        return EDITABLE !== undefined;
      case selectedModeEnum.EDITABLE_NO_CONTENT:
        return EDITABLE_NO_CONTENT !== undefined;
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
      fontSize: "20px",
      type: "icon",
    },
  },
]);

let startSelectionIndex: number = 0;
let endSelectionIndex: number = 0;

watch(
  () => props.show,
  (newValue) => {
    optionBarShow.value = newValue;
    if (newValue === true && !logoIconShow.value) {
      consoleLog(LogLevelEnum.DEBUG, "===> Show menu");
      const activeElement = document.activeElement as HTMLElement;
      if (
        selectedMode.value === selectedModeEnum.EDITABLE_NO_CONTENT ||
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
        let selectedText = selection!.toString();
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
    if (_width > 800) {
      width.value = 800;
    }
  }
);

watch(
  () => props.selectedMode,
  (newValue) => {
    selectedMode.value = newValue as selectedModeEnum;
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
  const chainBuilder = new ChainBuilder(currentFeature.value.Chains);
  consoleLog(LogLevelEnum.DEBUG, variables);
  for (const key in variables) {
    const storageKey = `FEATURE:${currentFeatureId.value}:${currentFeatureMode.value}:variable:${key}`;
    consoleLog(LogLevelEnum.DEBUG, storageKey);
    await ChromeStorage.getInstance().set(storageKey, variables[key]);
  }
  await chainBuilder.buildChains(variables);
  const result = await chainBuilder.executeChains();

  let startPart: string;
  let endPart: string;
  if (
    (currentFeatureMode.value === selectedModeEnum.EDITABLE_NO_CONTENT ||
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
      (currentFeatureMode.value === selectedModeEnum.EDITABLE_NO_CONTENT ||
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
      ElMessage.error(
        "ChatGPT is not responding. Please try again later or refresh the page. 👉 https://chat.openai.com/"
      );
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
  consoleLog(LogLevelEnum.DEBUG, "handleFeatureClick", index, type, id);
  outputContent.value = "";
  popoverVisible.value = true;
  handleFeature(id, featureSchema[type]!, type);
}

function close() {
  consoleLog(LogLevelEnum.DEBUG, "Close");
  popoverVisible.value = false;
  setTimeout(() => {
    optionBarShow.value = false;
    emits("close");
  }, 0);
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

const handleClickOutside = (event: MouseEvent) => {
  consoleLog(LogLevelEnum.DEBUG, "handleClickOutside");
  if (
    clickOutsideFocus.value &&
    !clickOutsideConfirm.value &&
    optionBarRef.value &&
    !optionBarRef.value.contains(event.target as Node) &&
    popoverRef.value &&
    !popoverRef.value.contains(event.target as Node) &&
    optionBarShow.value
  ) {
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
  logoIconShow.value = true;
  popoverVisible.value = false;
  setTimeout(() => {
    optionBarShow.value = false;
  }, 0);
};

const handleLogoIcon = () => {
  logoIconShow.value = false;
  optionBarShow.value = true;
  popoverVisible.value = true;
};

const handleCommand = (command: OptionCommandType) => {
  switch (command) {
    case OptionCommandType.SETTINGS:
      const data: IPCMessageType = {
        topic: IPCTopicEnum.COMMUNICATION,
        type: CommunicationMessageTypeEnum.OPEN_OPTIONS_PAGE,
        message: "Open options page",
      };
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
  optionBarRef.value = document.querySelector(".option-bar") as HTMLDivElement;
  popoverRef.value = document.querySelector(".el-popover") as HTMLDivElement;
  document.addEventListener("mousedown", handleClickOutside);
  const data: IPCMessageType = {
    topic: IPCTopicEnum.COMMUNICATION,
    type: CommunicationMessageTypeEnum.GET_FEATURES,
    message: "Get JSON Features",
  };
  chrome.runtime.sendMessage(data, async (response) => {
    if (response.decrypted) {
      featureList.value = response.decrypted;
      enabledFeatureStates.value = await Promise.all(
        response.decrypted.map((feature) => getFeatureEnabledState(feature))
      );
    } else {
      featureList.value = [];
    }
  });
});

onUnmounted(() => {
  consoleLog(LogLevelEnum.DEBUG, "onUnmounted");
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<style scoped>
.option-bar {
  position: absolute;
  z-index: 99999;
}

.minimize-icon {
  position: absolute;
  top: 8px;
  right: 36px;
  cursor: pointer;
}

.close-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

.cword-icon {
  position: fixed;
  right: 8px;
  bottom: 160px;
}

.cword-icon-bar {
  position: absolute;
  top: -16px;
  right: -16px;
}
</style>

<template>
  <slot name="main">
    <div class="upload-main">
      <ElScrollbar ref="scrollContentRef" :maxHeight="contentMaxHeight">
        <ElTimeline>
          <ElTimelineItem timestamp="Input" placement="top">
            <ElCard>
              <ElMenu
                :default-active="InputMode.UPLOAD"
                mode="horizontal"
                :ellipsis="false"
                @select="handleSelectInput"
              >
                <ElMenuItem index="0">UPLOAD</ElMenuItem>
                <ElMenuItem index="1">INSERT TEXT</ElMenuItem>
                <ElMenuItem index="2">URL</ElMenuItem>
              </ElMenu>
              <ElUpload
                v-if="activeIndexInput === InputMode.UPLOAD"
                class="upload-item-menu"
                drag
                :file-list="fileList"
                :on-success="onSuccess"
                :on-error="onError"
                :on-progress="onProgress"
                :before-upload="beforeUpload"
                :action="`${unstructuredApiUrl}/loader/upload?chunk_size=500&chunk_overlap=0`"
              >
                <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
                <div class="el-upload__text">
                  Drop file here or <em>click to upload</em>
                </div>

                <template #tip>
                  <div class="el-upload__tip">
                    .txt .pdf .doc .docx .rtf .ppt .pptx .xls .xlsx .csv .json
                    .xml .html .css .cpp .js .py .java ... and many other text
                    formats
                  </div>
                </template>
              </ElUpload>

              <ElInput
                v-if="activeIndexInput === InputMode.INSERT_TEXT"
                class="upload-item-menu"
                v-model="insertText"
                placeholder="Please insert text here"
                :autosize="{ minRows: 9, maxRows: 20 }"
                type="textarea"
                @keydown="handleKey"
                @keyup="handleKey"
                @keypress="handleKey"
              />
              <ElInput
                v-if="activeIndexInput === InputMode.URL"
                class="upload-item-menu"
                v-model="url"
                placeholder="https://example.com"
                @keydown="handleKey"
                @keyup="handleKey"
                @keypress="handleKey"
              />
            </ElCard>
          </ElTimelineItem>
          <ElTimelineItem timestamp="Menu" placement="top">
            <ElCard>
              <Icon
                class="upload-menu-card-loading"
                icon="line-md:loading-twotone-loop"
                :style="{
                  visibility: isUploading ? 'visible' : 'hidden',
                }"
              />
              <ElButtonGroup class="el-upload__tip" style="margin-left: auto">
                <template
                  v-for="(feature, index) in filteredFeatureList"
                  :key="index"
                >
                  <ElTooltip
                    :hide-after="0"
                    :content="feature.UPLOAD?.title"
                    placement="top"
                    v-if="feature.enabled"
                  >
                    <ElButton
                      type="success"
                      plain
                      @click="
                        handleFeatureClick(
                          feature,
                          index,
                          FeatureModeEnum.UPLOAD
                        )
                      "
                      :disabled="isUploading"
                    >
                      <Icon
                        :icon="feature.UPLOAD?.Icon.content || ''"
                        :style="{ fontSize: feature.UPLOAD?.Icon.fontSize }"
                        v-if="feature.UPLOAD?.Icon.type === 'icon'"
                      />
                      <div
                        v-if="feature.UPLOAD?.Icon.type === 'svg'"
                        v-html="feature.UPLOAD?.Icon.content"
                      ></div>
                    </ElButton>
                  </ElTooltip>
                </template>
              </ElButtonGroup>
            </ElCard>
          </ElTimelineItem>
          <ElTimelineItem timestamp="Output" placement="top">
            <ElCard>
              <div style="display: flex; justify-content: flex-end">
                <ElAffix v-if="checkAffix" position="top" :offset="66">
                  <ElButtonGroup>
                    <ElTooltip
                      :hide-after="0"
                      content="Clean output"
                      placement="top"
                    >
                      <ElButton plain @click="handleCleanOutput">
                        <Icon
                          icon="carbon:clean"
                          :style="{ fontSize: '20px' }"
                        />
                      </ElButton>
                    </ElTooltip>
                    <ElTooltip
                      :hide-after="0"
                      content="Regenerate"
                      placement="top"
                    >
                      <ElButton plain @click="handleRegenerate">
                        <Icon icon="ion:reload" :style="{ fontSize: '20px' }" />
                      </ElButton>
                    </ElTooltip>
                    <ElTooltip
                      :hide-after="0"
                      content="Stop generating"
                      placement="top"
                    >
                      <ElButton plain @click="handleStopGenerating">
                        <Icon
                          icon="ph:stop-duotone"
                          :style="{ fontSize: '20px' }"
                        />
                      </ElButton>
                    </ElTooltip>

                    <ElTooltip
                      :hide-after="0"
                      content="Copy to clipboard"
                      placement="top"
                    >
                      <ElButton plain @click="handleCopyToClipboard">
                        <Icon
                          icon="solar:copy-line-duotone"
                          :style="{ fontSize: '20px' }"
                        />
                      </ElButton>
                    </ElTooltip>
                  </ElButtonGroup>
                </ElAffix>
                <ElButtonGroup v-else-if="!checkAffix">
                  <ElTooltip
                    :hide-after="0"
                    content="Clean output"
                    placement="top"
                  >
                    <ElButton plain @click="handleCleanOutput">
                      <Icon icon="carbon:clean" :style="{ fontSize: '20px' }" />
                    </ElButton>
                  </ElTooltip>
                  <ElTooltip
                    :hide-after="0"
                    content="Regenerate"
                    placement="top"
                  >
                    <ElButton plain @click="handleRegenerate">
                      <Icon icon="ion:reload" :style="{ fontSize: '20px' }" />
                    </ElButton>
                  </ElTooltip>
                  <ElTooltip
                    v-if="isStreaming"
                    :hide-after="0"
                    content="Stop generating"
                    placement="top"
                  >
                    <ElButton plain @click="handleStopGenerating">
                      <Icon
                        icon="ph:stop-duotone"
                        :style="{ fontSize: '20px' }"
                      />
                    </ElButton>
                  </ElTooltip>

                  <ElTooltip
                    :hide-after="0"
                    content="Copy to clipboard"
                    placement="top"
                  >
                    <ElButton plain @click="handleCopyToClipboard">
                      <Icon
                        icon="solar:copy-line-duotone"
                        :style="{ fontSize: '20px' }"
                      />
                    </ElButton>
                  </ElTooltip>
                </ElButtonGroup>
              </div>
              <div
                ref="contentRef"
                class="upload-scroll-content"
                :style="{
                  padding: '20px',
                }"
              >
                <Icon
                  class="upload-scroll-content-loading"
                  icon="line-md:loading-twotone-loop"
                  :style="{
                    visibility: isStreaming ? 'visible' : 'hidden',
                  }"
                />
                <div ref="outputOuterRef" v-html="outputContentRender"></div>
              </div>
            </ElCard>
          </ElTimelineItem>
        </ElTimeline>
      </ElScrollbar>
    </div>
  </slot>

  <slot name="drawer">
    <DrawerPromptInitialize
      v-model:feature="currentFeature"
      v-model:visible="drawer"
      :feature-schema="featureSchema"
      :form-data="formDataVariableSchema"
      :feature-id="currentFeatureId"
      :feature-mode="currentFeatureMode"
      @run="handleStartGenerateResponse"
      @close="handleCloseDrawer"
    ></DrawerPromptInitialize>
  </slot>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch,
} from "vue";
import { Icon } from "@iconify/vue";
import {
  UploadFile,
  UploadFiles,
  UploadProgressEvent,
  UploadProps,
  UploadUserFile,
} from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { ElButton } from "element-plus";
import { ElTooltip } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { ElUpload } from "element-plus";
import { ElIcon } from "element-plus";
import { ElTimeline } from "element-plus";
import { ElTimelineItem } from "element-plus";
import { ElScrollbar } from "element-plus";
import { ElMenu } from "element-plus";
import { ElMenuItem } from "element-plus";
import { ElAffix } from "element-plus";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import {
  AIMode,
  APP_CHAT_GPT_MAX_CHUNKSIZE,
  APP_CLAUDE_MAX_CHUNKSIZE,
  APP_BARD_MAX_CHUNKSIZE,
  APP_MAX_RETRIES,
  APP_RETRY_TIME,
  AI_SYSTEM_RESPONSE_END_BLOCK,
  AI_SYSTEM_RESPONSE_START_BLOCK,
  MAXIMUM_FEATURES_SIZE_DEFAULT,
} from "@/constants";
import { DrawerPromptInitialize } from "@/components";
import { LoadImg } from ".";
import { PromptTemplate } from "@/lib/prompt_template";
import { Chain } from "@/lib/chain";
import { CMException } from "@/types/exception";
import { LLM } from "@/lib/llm";
import {
  consoleLog,
  LogLevelEnum,
  sleep,
  textConcat,
  textSplit,
  crawlWebsite,
} from "@/utils";
import { Status } from "@/constants/status";
import {
  CommunicationMessageTypeEnum,
  IPCMessageType,
  IPCTopicEnum,
  ResPayloadType,
  FeatureModeEnum,
} from "@/types";
import { FeatureSchema, FeatureType } from "@/lib/features";
import { SystemVariableParser } from "@/lib";
import { ChainBuilder } from "@/lib/chain/chain_builder";
import { ConversationModeEnum } from "@/types/conversation";
import { useUserSettingsStore } from "@/store/user_settings";
import { ResponseParser } from "@/lib/response_parser";
import { getJsonFeatures, setJsonFeature } from "@/lib/common";

enum InputMode {
  UPLOAD = "0",
  INSERT_TEXT = "1",
  URL = "2",
}

const userSettings = useUserSettingsStore();

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);
marked.use({ silent: true, mangle: false, breaks: true });

const props = defineProps({
  start: {
    type: Boolean,
    required: false,
    default: false,
  },
  isStreaming: {
    type: Boolean,
    required: false,
    default: false,
  },
  drawerShow: {
    type: Boolean,
    required: false,
    default: false,
  },
  maxHeight: {
    type: Number,
    required: false,
    default: (90 / 100) * window.innerHeight, // 80% of the page height
  },
  conversationId: {
    type: String,
    required: false,
    default: "",
  },
});

const emits = defineEmits([
  "update:isStreaming",
  "update:drawerShow",
  "update:conversationId",
  "complete",
]);

const aiProvider = computed(() => userSettings.getAiProvider);
const aiProviderKey = computed(() => {
  if (userSettings.getAiProvider === AIMode.CHAT_GPT) {
    return "ChatGPT";
  } else if (userSettings.getAiProvider === AIMode.BARD) {
    return "Gemini";
  } else if (userSettings.getAiProvider === AIMode.CLAUDE) {
    return "Claude";
  }
  return "ChatGPT";
});

const filteredFeatureList = computed(() => {
  const _filteredFeatureList = featureList.value.filter((feature) => {
    const { UPLOAD } = feature;

    switch (featureMode.value) {
      case FeatureModeEnum.UPLOAD:
        return UPLOAD !== undefined && UPLOAD![aiProviderKey.value] !== null;
      default:
        return false;
    }
  });
  return _filteredFeatureList;
});

const outputContentRender = computed(() => {
  return marked.parse(outputContent.value);
});

const isStreaming = ref(false);
const isUploading = ref(false);
const llm = new LLM();
const featureSchema: Ref<FeatureSchema> = ref({} as FeatureSchema);
const featureMode: Ref<FeatureModeEnum> = ref(FeatureModeEnum.UPLOAD);
const currentFeature: Ref<FeatureType> = ref({} as FeatureType);
const currentFeatureId: Ref<string> = ref("");
const currentFeatureMode: Ref<FeatureModeEnum> = ref(FeatureModeEnum.UPLOAD);
const featureList: Ref<FeatureSchema[]> = ref([]);

const drawer = ref(false);
const formDataVariableSchema = ref<{ [key: string]: string }>({});
const clickOutsideFocus = ref(true);
const scrollContentRef = ref<InstanceType<typeof ElScrollbar>>();
const contentRef: Ref<HTMLDivElement> = ref(null as any);
const outputOuterRef = ref<HTMLDivElement>();
const contentMaxHeight = ref(props.maxHeight);
const outputContent = ref("");
const activeIndexInput = ref(InputMode.UPLOAD);
const insertText = ref("");
const url = ref("");
const fileList = ref<UploadUserFile[]>([]);
const checkAffix = ref(false);

const conversationId: Ref<string> = ref("");
let uploadItems: string[] = [];
let messageId: string | null = null;
let contextIds: string[][] = [];
let continueGenerating: boolean = false;
let stopGeneratingCheck: boolean = false;
const unstructuredApiUrl = import.meta.env.VITE_UNSTRUCTURED_API;

watch(
  () => isStreaming.value,
  (value) => {
    emits("update:isStreaming", value);
  }
);

watch(
  () => props.drawerShow,
  (value) => {
    drawer.value = value;
  }
);

watch(
  () => drawer.value,
  (value) => {
    emits("update:drawerShow", value);
  }
);

watch(
  () => props.maxHeight,
  (value) => {
    contentMaxHeight.value = value;
  }
);

watch(
  () => props.conversationId,
  (value) => {
    conversationId.value = value;
  }
);

watch(
  () => conversationId.value,
  (value) => {
    emits("update:conversationId", value);
  }
);

watch(
  () => outputContent.value,
  (value) => {
    if (outputOuterRef.value!.clientHeight > (80 / 100) * window.innerHeight) {
      checkAffix.value = true;
    }
  }
);

function resetVariables() {
  outputContent.value = "";
  isStreaming.value = false;
  fileList.value = [];
  uploadItems = [];
  insertText.value = "";
  url.value = "";
  checkAffix.value = false;
}

async function close(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    if (isStreaming.value) {
      ElMessageBox.confirm(
        "The result is being streamed, do you want to stop?",
        "Warning",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(async () => {
          await handleStopGenerating();
          deleteConversation();
          resetVariables();
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    } else {
      deleteConversation();
      resetVariables();
      resolve(true);
    }
  });
}

async function handleStopGenerating() {
  conversationId.value = await stopGenerating();
  stopGeneratingCheck = true;
}

const handleSelectInput = (key: string, keyPath: string[]) => {
  const inputModeEnum: InputMode = key as InputMode;
  activeIndexInput.value = inputModeEnum;
};

const onSuccess = async (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  uploadItems = response.payload.items;
  isUploading.value = false;
};

const onError = (
  error: Error,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  try {
    const resStt: ResPayloadType = JSON.parse(error.message);
    ElMessage.error(resStt.msg);
  } catch {
    ElMessage.error(error.message);
  }
  isUploading.value = false;
};

const onProgress = (
  evt: UploadProgressEvent,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {};

const beforeUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 4) {
    ElMessage.error("File size can not exceed 4MB!");
    return false;
  }
  isUploading.value = true;
  return true;
};

const deleteConversation = () => {
  consoleLog(
    LogLevelEnum.DEBUG,
    "onDeleteConversation Upload",
    conversationId.value
  );
  if (conversationId.value !== "") {
    llm.deleteConversation({
      aiProvider: aiProvider.value,
      conversationId: conversationId.value!,
    });
  }
  conversationId.value = "";
  messageId = null;
  emits("complete");
};

const scrollToBottom = () => {
  scrollContentRef.value!.setScrollTop(contentRef.value!.clientHeight);
};

const handleStartGenerateResponse = (formDataVariableSchema: {
  [key: string]: string;
}) => {
  clickOutsideFocus.value = true;
  startGenerateResponse(formDataVariableSchema);
};

const handleCloseDrawer = () => {
  clickOutsideFocus.value = true;
  isStreaming.value = false;
};

const handleRegenerate = () => {
  if (isStreaming.value) {
    ElMessageBox.alert(
      "You cannot regenerate again because the response is being processed",
      "Warning",
      {
        confirmButtonText: "OK",
        callback: () => {},
      }
    );
    return;
  }
  stopGeneratingCheck = false;
  startGenerateResponse(formDataVariableSchema.value);
};

async function stopGenerating(): Promise<string> {
  if (isStreaming.value) {
    isStreaming.value = false;
    const resData = await llm.stopGenerating();
    return resData.conversationId;
  } else {
    return conversationId.value!;
  }
}

const handleCleanOutput = () => {
  if (isStreaming.value) {
    ElMessageBox.alert(
      "You cannot clean the output because the response is being processed",
      "Warning",
      {
        confirmButtonText: "OK",
        callback: () => {},
      }
    );
    return;
  }
  outputContent.value = "";
};

const handleCopyToClipboard = () => {
  consoleLog(LogLevelEnum.DEBUG, "handleCopyToClipboard");
  if (outputContent.value) {
    navigator.clipboard.writeText(outputContent.value);
  }
};

const startGenerateResponse = async (variables: { [key: string]: string }) => {
  consoleLog(LogLevelEnum.DEBUG, variables);
  try {
    if (activeIndexInput.value === InputMode.INSERT_TEXT) {
      if (insertText.value.trim() === "") {
        return;
      }
      uploadItems = await textSplit(insertText.value);
    } else if (activeIndexInput.value === InputMode.URL) {
      if (url.value.trim() === "") {
        return;
      }
      uploadItems = await crawlWebsite(url.value);
    }
    if (uploadItems.length === 0) {
      return;
    }

    let items: string[] = [];
    if (aiProvider.value === AIMode.CHAT_GPT) {
      const chunkSize: number = currentFeature.value[aiProviderKey.value]!
        .Segmentation
        ? currentFeature.value[aiProviderKey.value]!.ChunkSize!
        : APP_CHAT_GPT_MAX_CHUNKSIZE;
      items = await textConcat(true, uploadItems, chunkSize);
    } else if (aiProvider.value === AIMode.CLAUDE) {
      const chunkSize: number = currentFeature.value[aiProviderKey.value]!
        .Segmentation
        ? currentFeature.value[aiProviderKey.value]!.ChunkSize!
        : APP_CLAUDE_MAX_CHUNKSIZE;
      items = await textConcat(true, uploadItems, chunkSize);
    } else if (aiProvider.value === AIMode.BARD) {
      const chunkSize: number = currentFeature.value[aiProviderKey.value]!
        .Segmentation
        ? currentFeature.value[aiProviderKey.value]!.ChunkSize!
        : APP_BARD_MAX_CHUNKSIZE;
      items = await textConcat(false, uploadItems, chunkSize);
    }
    if (
      !currentFeature.value[aiProviderKey.value]!.Segmentation &&
      items.length > 1
    ) {
      ElMessage.error(
        "This feature exceeds the number of input tokens allowed! Please upload the file or insert the text with a smaller."
      );
      return;
    }

    for (const key in variables) {
      featureSchema.value[currentFeatureMode.value]!.variableSchema[key].value =
        variables[key];
    }
    setJsonFeature(featureSchema.value);

    outputContent.value = "";
    let completeContent = "";
    continueGenerating = false;
    conversationId.value = "";
    messageId = null;

    isStreaming.value = true;
    for (let i = 0; i < items.length; i++) {
      let retryCount = 0;
      try {
        do {
          if (stopGeneratingCheck) {
            return;
          }
          SystemVariableParser.getInstance().setUploadedText(items[i]);
          const chainBuilder = new ChainBuilder(
            llm,
            currentFeature.value[aiProviderKey.value]!.Chains
          );
          await chainBuilder.buildChains(variables);
          const modelName =
            aiProvider.value === AIMode.CHAT_GPT
              ? userSettings.getChatgptModel
              : "";
          const result = await chainBuilder.executeChains(true, {
            aiProvider: aiProvider.value,
            modelName: modelName,
            conversationId: conversationId.value!,
            messageId: messageId!,
            contextIds: contextIds,
            conversationMode: continueGenerating
              ? ConversationModeEnum.CONTINUE
              : ConversationModeEnum.NORMAL,
            deleteConversation: false,
          });
          result.on("data", async (data) => {
            outputContent.value = completeContent + data;
            nextTick(() => {
              scrollToBottom();
            });
          });
          let resStt: ResPayloadType = await new Promise<ResPayloadType>(
            (resolve) => {
              result.on("complete", async (data) => {
                consoleLog(LogLevelEnum.DEBUG, "=====>complete");
                consoleLog(LogLevelEnum.DEBUG, `${data.message}`);
                completeContent += "\n";
                outputContent.value = completeContent;
              });
              result.on("endOfChain", async (data) => {
                consoleLog(LogLevelEnum.DEBUG, "=====>endOfChain");
                const extractText =
                  ResponseParser.getInstance().extractTextFromBlock(
                    AI_SYSTEM_RESPONSE_START_BLOCK,
                    AI_SYSTEM_RESPONSE_END_BLOCK,
                    data.message
                  );
                if (extractText) {
                  completeContent += extractText;
                } else {
                  completeContent += data.message;
                }
                conversationId.value = data.conversationId;
                messageId = data.messageId;
                continueGenerating = data.endTurn ? false : true;
                contextIds = data.contextIds ? data.contextIds : null;
                consoleLog(LogLevelEnum.DEBUG, `${data.message}`);
                if (!continueGenerating) {
                  completeContent += "\n\n";
                }
                outputContent.value = completeContent;
                nextTick(() => {
                  scrollToBottom();
                });
                resolve({
                  status: Status.SUCCESS,
                  msg: "Successfully generated",
                });
              });
              result.on("error", (error) => {
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
                resolve({
                  status: Status.ERROR,
                  code: error.code,
                  msg: error.message,
                });
              });
            }
          );

          if (resStt.status === Status.ERROR) {
            retryCount++;
            if (retryCount > APP_MAX_RETRIES) {
              ElMessage.error("Exceeded maximum retry attempts.");
              return;
            }
            await sleep(APP_RETRY_TIME);
          } else {
            nextTick(() => {
              scrollToBottom();
            });
            retryCount = 0;
            if (i < items.length - 1 || continueGenerating) {
              if (aiProvider.value === AIMode.CHAT_GPT) {
                await sleep(5000);
              } else if (aiProvider.value === AIMode.CLAUDE) {
                await sleep(1000);
              } else if (aiProvider.value === AIMode.BARD) {
                await sleep(1000);
              }
            }
          }
          consoleLog(
            LogLevelEnum.DEBUG,
            ">> continueGenerating",
            continueGenerating,
            retryCount
          );
        } while (continueGenerating || retryCount > 0);
      } catch (error) {
        consoleLog(LogLevelEnum.DEBUG, error);
        isStreaming.value = false;
        deleteConversation();
        break;
      }
    }
    isStreaming.value = false;
    deleteConversation();
  } catch (e) {
    isStreaming.value = false;
    deleteConversation();
  }
};

async function handleFeature(
  id: string,
  feature: FeatureType,
  type: FeatureModeEnum
) {
  const variables: { [key: string]: string } = {};
  let checkShowDrawer: boolean = false;
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
    const value = feature.variableSchema[key].value;
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

async function handleFeatureClick(
  _featureSchema: FeatureSchema,
  index: number,
  type: FeatureModeEnum
) {
  const id: string = _featureSchema.id;
  if (isStreaming.value) {
    ElMessageBox.alert(
      "You cannot switch feature because the response is being streamed",
      "Warning",
      {
        confirmButtonText: "OK",
        callback: () => {},
      }
    );
    return;
  }
  outputContent.value = "";
  featureSchema.value = _featureSchema;
  handleFeature(id, _featureSchema[type]!, type);
}

const handleKey = (event: Event | KeyboardEvent) => {
  event.stopPropagation();
};

onMounted(async () => {
  const resFeatures = await getJsonFeatures(
    false,
    1,
    MAXIMUM_FEATURES_SIZE_DEFAULT,
    null,
    null
  );
  if (resFeatures.list) {
    featureList.value = resFeatures.list;
  } else {
    featureList.value = [];
  }
});

onUnmounted(() => {});

defineExpose({
  close,
  stopGenerating,
});
</script>

<style scoped></style>

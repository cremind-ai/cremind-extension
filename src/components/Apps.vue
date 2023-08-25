<template>
  <!-- Chat Dialog -->
  <ElDialog
    v-model="appDialogVisible"
    :show-close="false"
    :file-list="fileList"
    :close-on-click-modal="false"
    :width="`80%`"
    :fullscreen="isMaximized"
    :before-close="handleCloseDialog"
  >
    <!-- Header -->
    <template #header>
      <ElButton
        class="apps-minimize-icon"
        type="warning"
        plain
        :icon="SemiSelect"
        @click="handleMinimize"
        size="small"
        circle
      ></ElButton>
      <ElButton
        class="apps-close-icon"
        type="danger"
        plain
        :icon="Close"
        @click="handleCloseDialog"
        size="small"
        circle
      ></ElButton>
      <ElButton
        class="apps-maximize-icon"
        type="success"
        plain
        :icon="FullScreen"
        @click="handleMaximize"
        size="small"
        circle
      ></ElButton>
      <div
        style="
          white-space: nowrap;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          font-size: 14px;
          line-height: 1.3;
        "
      >
        <div>
          CreMind AI
          <LoadImg
            class="apps-cremind-icon-bar"
            :filename="'CreMind-logo-64.png'"
            :width="25"
          />
        </div>
      </div>
    </template>

    <ElScrollbar ref="scrollContentRef" :maxHeight="contentMaxHeight">
      <ElTimeline>
        <ElTimelineItem timestamp="Input" placement="top">
          <ElCard>
            <ElMenu
              :default-active="InputMode.UPLOAD"
              class="ElMenu-demo"
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
              class="upload-demo"
              drag
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
              v-model="insertText"
              placeholder="Please insert text here"
              :autosize="{ minRows: 9, maxRows: 20 }"
              type="textarea"
            />
            <ElInput
              v-if="activeIndexInput === InputMode.URL"
              v-model="url"
              placeholder="https://example.com"
            />
          </ElCard>
        </ElTimelineItem>
        <ElTimelineItem timestamp="Menu" placement="top">
          <ElCard>
            <ElButtonGroup class="el-upload__tip" style="margin-left: auto">
              <template
                v-for="(feature, index) in filteredFeatureList"
                :key="index"
              >
                <ElTooltip
                  :content="feature.APP?.title"
                  placement="top"
                  v-if="enabledFeatureStates[convertIndexToOriginal(index)]"
                >
                  <ElButton
                    type="success"
                    plain
                    @click="
                      handleFeatureClick(feature, index, selectedModeEnum.APP)
                    "
                  >
                    <Icon
                      :icon="feature.APP?.Icon.content || ''"
                      :style="{ fontSize: feature.APP?.Icon.fontSize }"
                      v-if="feature.APP?.Icon.type === 'icon'"
                    />
                    <div
                      v-if="feature.APP?.Icon.type === 'svg'"
                      v-html="feature.APP?.Icon.content"
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
              <ElButtonGroup>
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
            <div
              ref="contentRef"
              class="apps-scroll-content"
              :style="{
                padding: '20px',
              }"
            >
              <div v-html="markedRender(outputContent)"></div>
              <!-- <pre style="white-space: pre-wrap; word-wrap: break-word">{{
                outputContent
              }}</pre> -->
            </div>
          </ElCard>
        </ElTimelineItem>
      </ElTimeline>
    </ElScrollbar>
    <!-- <template #footer>hello footer</template> -->
  </ElDialog>

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
import { computed, nextTick, onMounted, Ref, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import {
  UploadFile,
  UploadFiles,
  UploadProgressEvent,
  UploadProps,
  UploadUserFile,
} from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { FullScreen } from "@element-plus/icons-vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { SemiSelect } from "@element-plus/icons-vue";
import { ElButton } from "element-plus";
import { ElTooltip } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElDialog } from "element-plus";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { ElUpload } from "element-plus";
import { ElIcon } from "element-plus";
import { ElTimeline, ElTimelineItem } from "element-plus";
import { ElDrawer } from "element-plus";
import { ElForm, ElFormItem } from "element-plus";
import { ElOption } from "element-plus";
import { ElSelect } from "element-plus";
import { ElScrollbar } from "element-plus";
import { ElMenu } from "element-plus";
import { ElMenuItem } from "element-plus";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import {
  APP_MAX_CHUNKSIZE,
  APP_MAX_RETRIES,
  APP_RETRY_TIME,
  ConversationRoleEnum,
} from "@/constants";
import { Chat } from "./Chat";
import { LoadImg } from ".";
import { PromptTemplate } from "@/lib/prompt_template";
import { Chain } from "@/lib/chain";
import { CWException } from "@/types/exception";
import { LLM } from "@/lib/llm";
import {
  consoleLog,
  LogLevelEnum,
  sleep,
  tokenConcat,
  textSplit,
  crawlWebsite,
} from "@/utils";
import { Status } from "@/constants/status";
import {
  CommunicationMessageTypeEnum,
  IPCMessageType,
  IPCTopicEnum,
  ResPayloadType,
  selectedModeEnum,
} from "@/types";
import { FeatureSchema, FeatureType } from "@/lib/features";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { SystemOptions } from "@/constants/system_variables";
import { SystemVariableParser } from "@/lib";
import { ChainBuilder } from "@/lib/chain/chain_builder";
import { ConversationModeEnum } from "@/types/conversation";
import {
  useVisibleManagerStore,
  VisibleManagerTypeEnum,
} from "@/store/visible_manager";

enum InputMode {
  UPLOAD = "0",
  INSERT_TEXT = "1",
  URL = "2",
}

const visibleManager = useVisibleManagerStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
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

const emits = defineEmits(["update:modelValue"]);

const appDialogVisible = ref(props.modelValue);
const isStreaming = ref(false);
const isMinimized = ref(false);
const isMaximized = ref(false);
const llm = new LLM();
const selectedMode: Ref<selectedModeEnum> = ref(selectedModeEnum.APP);
const currentFeature: Ref<FeatureType> = ref({} as FeatureType);
const currentFeatureId: Ref<string> = ref("");
const currentFeatureMode: Ref<selectedModeEnum> = ref(selectedModeEnum.APP);
const featureList: Ref<FeatureSchema[]> = ref([]);

const filteredFeatureList = computed(() => {
  const _filteredFeatureList = featureList.value.filter((feature) => {
    const { APP } = feature;

    switch (selectedMode.value) {
      case selectedModeEnum.APP:
        return APP !== undefined;
      default:
        return false;
    }
  });
  return _filteredFeatureList;
});
const enabledFeatureStates: Ref<boolean[]> = ref([]);
const drawer = ref(false);
const formDataVariableSchema = ref<{ [key: string]: string }>({});
const clickOutsideFocus = ref(true);
const scrollContentRef = ref<InstanceType<typeof ElScrollbar>>();
const contentRef: Ref<HTMLDivElement> = ref(null as any);
const contentMaxHeight = ref(
  (90 / 100) * document.documentElement.offsetHeight
); // 90% of the page height
const outputContent = ref("");
const activeIndexInput = ref(InputMode.UPLOAD);
const insertText = ref("");
const url = ref("");
const fileList = ref<UploadUserFile[]>([]);
const currentVisibleManager = computed(() => {
  return visibleManager.getVisible(VisibleManagerTypeEnum.APP_DIALOG);
});

let uploadItems: string[] = [];
let conversationId: string | null = null;
let messageId: string | null = null;
let continueGenerating: boolean = false;
const unstructuredApiUrl = import.meta.env.VITE_UNSTRUCTURED_API;

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      visibleManager.takeVisible(VisibleManagerTypeEnum.APP_DIALOG);
    }
    appDialogVisible.value = value;
  }
);

watch(
  () => appDialogVisible.value,
  (value) => {
    emits("update:modelValue", value);
  }
);

watch(
  () => currentVisibleManager.value,
  (value) => {
    appDialogVisible.value = value;
  }
);

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

const handleCloseDialog = () => {
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
        isStreaming.value = false;
      })
      .catch(() => {});
  } else {
    deleteConversation();
    outputContent.value = "";
    isStreaming.value = false;
    appDialogVisible.value = false;
    fileList.value = [];
    uploadItems = [];
    visibleManager.resetShow();
  }
};

const handleMinimize = () => {
  appDialogVisible.value = false;
  visibleManager.resetShow();
};

const handleMaximize = () => {
  if (isMaximized.value) {
    isMaximized.value = false;
  } else {
    isMaximized.value = true;
  }
};

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
};

const onProgress = (
  evt: UploadProgressEvent,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {};

const beforeUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("File size can not exceed 2MB!");
    return false;
  }
  return true;
};

const markedRender = (text: string) => {
  return marked.parse(text);
};

const deleteConversation = () => {
  consoleLog(LogLevelEnum.DEBUG, "onDeleteConversation", conversationId);
  if (conversationId) {
    llm.deleteConversation({
      conversationId: conversationId!,
    });
  }

  conversationId = null;
  messageId = null;
};

const scrollToBottom = () => {
  scrollContentRef.value!.setScrollTop(contentRef.value!.clientHeight);
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

    console.log(uploadItems);

    const chunkSize: number = currentFeature.value.Segmentation
      ? currentFeature.value.ChunkSize!
      : APP_MAX_CHUNKSIZE;
    const items = await tokenConcat(uploadItems, chunkSize);
    if (!currentFeature.value.Segmentation && items.length > 1) {
      ElMessage.error(
        "This feature exceeds the number of input tokens allowed! Please upload the file or insert the text with a smaller."
      );
      return;
    }

    for (const key in variables) {
      const storageKey = `FEATURE:${currentFeatureId.value}:${currentFeatureMode.value}:variable:${key}`;
      consoleLog(LogLevelEnum.DEBUG, storageKey);
      await ChromeStorage.getInstance().set(storageKey, variables[key]);
    }

    outputContent.value = "";
    let completeContent = "";
    continueGenerating = false;
    conversationId = null;
    messageId = null;

    for (let item of items) {
      let retryCount = 0;
      try {
        do {
          SystemVariableParser.getInstance().setUploadedText(item);
          const chainBuilder = new ChainBuilder(
            llm,
            currentFeature.value.Chains
          );
          await chainBuilder.buildChains(variables);
          const result = await chainBuilder.executeChains(true, {
            conversationId: conversationId,
            messageId: messageId,
            conversationMode: continueGenerating
              ? ConversationModeEnum.CONTINUE
              : ConversationModeEnum.NORMAL,
            deleteConversation: false,
          });
          result.on("data", (data) => {
            outputContent.value += data;
            scrollToBottom();
          });
          let resStt: ResPayloadType = await new Promise<ResPayloadType>(
            (resolve) => {
              result.on("complete", (data) => {
                consoleLog(LogLevelEnum.DEBUG, "=====>complete");
                consoleLog(LogLevelEnum.DEBUG, `${data.message}`);
                outputContent.value += "\n";
              });
              result.on("endOfChain", (data) => {
                consoleLog(LogLevelEnum.DEBUG, "=====>endOfChain");
                completeContent += data.message;
                conversationId = data.conversationId;
                messageId = data.messageId;
                continueGenerating = data.endTurn ? false : true;
                isStreaming.value = false;
                consoleLog(LogLevelEnum.DEBUG, `${data.message}`);
                if (!continueGenerating) {
                  completeContent += "\n\n";
                }
                outputContent.value = completeContent;

                resolve({
                  status: Status.SUCCESS,
                  msg: "Successfully generated",
                });
              });
              result.on("error", (error) => {
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
            retryCount = 0;
            await sleep(5000);
          }
          consoleLog(
            LogLevelEnum.DEBUG,
            ">> continueGenerating",
            continueGenerating,
            retryCount
          );
        } while (continueGenerating || retryCount > 0);
        deleteConversation();
      } catch (error) {
        consoleLog(LogLevelEnum.DEBUG, error);
        break;
      }
    }
  } catch (e) {}
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
  handleFeature(id, featureSchema[type]!, type);
}

onMounted(() => {
  visibleManager.register(VisibleManagerTypeEnum.APP_DIALOG);
  const data: IPCMessageType = {
    topic: IPCTopicEnum.COMMUNICATION,
    type: CommunicationMessageTypeEnum.GET_FEATURES,
    message: "Get JSON Features",
  };
  chrome.runtime.sendMessage(data, async (response) => {
    if (response.features) {
      featureList.value = response.features;
      enabledFeatureStates.value = await Promise.all(
        response.features.map((feature: any) => getFeatureEnabledState(feature))
      );
    } else {
      featureList.value = [];
    }
  });
});
</script>
<style scoped></style>

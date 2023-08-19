<template>
  <!-- Chat Dialog -->
  <ElDialog
    v-model="appDialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :width="`80%`"
    draggable
    :before-close="handleCloseDialog"
  >
    <!-- Header -->
    <template #header>
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
        @click="handleCloseDialog"
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
            class="cremind-icon-bar"
            :filename="'CreMind-logo-64.png'"
            :width="25"
          />
        </div>
      </div>
    </template>

    <!-- Chat component -->
    <!-- <Chat
      ref="chatRef"
      :chats="chats"
      @new-chat="newChat"
      v-model:blockSend="isStreaming"
    /> -->
    <ElScrollbar ref="scrollContentRef" :maxHeight="contentMaxHeight">
      <ElTimeline>
        <ElTimelineItem timestamp="Upload" placement="top">
          <ElCard>
            <ElUpload
              class="upload-demo"
              drag
              :on-success="onSuccess"
              :on-error="onError"
              :on-progress="onProgress"
              :before-upload="beforeUpload"
              action="http://localhost:3002/api/v1/loader/upload?chunk_size=500&chunk_overlap=0"
            >
              <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
              <div class="el-upload__text">
                Drop file here or <em>click to upload</em>
              </div>

              <template #tip>
                <div class="el-upload__tip">.txt .pdf .doc .js .py ...</div>
              </template>
            </ElUpload>
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
            <div
              ref="contentRef"
              class="scroll-content"
              :style="{
                padding: '20px',
              }"
            >
              <div v-html="markedRender(outputContent)"></div>
            </div>
          </ElCard>
        </ElTimelineItem>
      </ElTimeline>
    </ElScrollbar>
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
import { computed, onMounted, reactive, Ref, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import {
  UploadFile,
  UploadFiles,
  UploadProgressEvent,
  UploadProps,
} from "element-plus";
import { Close } from "@element-plus/icons-vue";
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
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { ConversationRoleEnum } from "@/constants";
import { Chat } from "./Chat";
import { LoadImg } from ".";
import { PromptTemplate } from "@/lib/prompt_template";
import { Chain } from "@/lib/chain";
import { CWException } from "@/types/exception";
import { LLM } from "@/lib/llm";
import { consoleLog, LogLevelEnum, tokenConcat } from "@/utils";
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
const contentMaxHeight = ref(500);
const outputContent = ref("");

let uploadItems: string[] = [];

watch(
  () => props.modelValue,
  (value) => {
    appDialogVisible.value = value;
  }
);

watch(
  () => appDialogVisible.value,
  (value) => {
    emits("update:modelValue", value);
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
      "The result is being streamed, do you want to exit?",
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
    isStreaming.value = false;
    appDialogVisible.value = false;
  }
};

const handleMinimize = () => {
  isMinimized.value = true;
};

const onSuccess = async (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  console.log(response);
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
) => {
  console.log(evt);
};

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

const startGenerateResponse = async (variables: { [key: string]: string }) => {
  consoleLog(LogLevelEnum.DEBUG, variables);
  try {
    if (uploadItems.length === 0) {
      return;
    }
    const items = await tokenConcat(uploadItems, 4000);
    if (!currentFeature.value.Segmentation && items.length > 1) {
      ElMessage.error(
        "This feature exceeds the number of input tokens allowed! Please upload the file with a smaller size."
      );
      return;
    }

    for (const key in variables) {
      const storageKey = `FEATURE:${currentFeatureId.value}:${currentFeatureMode.value}:variable:${key}`;
      consoleLog(LogLevelEnum.DEBUG, storageKey);
      await ChromeStorage.getInstance().set(storageKey, variables[key]);
    }

    outputContent.value = "";
    console.log(items);
    for (let item of items) {
      try {
        SystemVariableParser.getInstance().setUploadedText(item);
        console.log(currentFeature.value.Chains);
        const chainBuilder = new ChainBuilder(currentFeature.value.Chains);
        await chainBuilder.buildChains(variables);
        const result = await chainBuilder.executeChains();
        result.on("data", (data) => {
          outputContent.value += data;
          scrollToBottom();
        });
        await new Promise((resolve) => {
          result.on("complete", (data) => {
            consoleLog(LogLevelEnum.DEBUG, "=====>complete");
            consoleLog(LogLevelEnum.DEBUG, `${data.message}`);
            outputContent.value += "\n";
          });
          result.on("endOfChain", (data) => {
            consoleLog(LogLevelEnum.DEBUG, "=====>endOfChain");
            isStreaming.value = false;
            consoleLog(LogLevelEnum.DEBUG, `${data.message}`);
            outputContent.value += "\n";
            resolve(null);
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
            resolve(null);
          });
        });
      } catch (error) {
        consoleLog(LogLevelEnum.DEBUG, error);
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }
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
  // outputContent.value = "";
  // popoverVisible.value = true;

  handleFeature(id, featureSchema[type]!, type);
}

onMounted(() => {
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
<style scoped>
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

.cremind-icon {
  position: fixed;
  right: 5px;
  bottom: 180px;
}

.scroll-content {
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  line-height: 1.3;
  color: var(--el-text-color-regular);
}
</style>

<template>
  <slot name="main">
    <div style="position: relative">
      <Icon
        class="quick-feature-card-loading"
        icon="line-md:loading-twotone-loop"
        :style="{
          visibility: isStreaming ? 'visible' : 'hidden',
        }"
      />
      <div style="display: flex; justify-content: flex-end; margin-right: 60px">
        <ElButtonGroup>
          <ElTooltip
            :hide-after="0"
            content="Regenerate response"
            placement="top"
          >
            <ElButton plain @click="handleRegenerate">
              <Icon icon="ion:reload" :style="{ fontSize: '20px' }" />
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
      <ElScrollbar ref="scrollContentRef" :maxHeight="contentMaxHeight">
        <div
          ref="contentRef"
          class="popup-card-scroll-content"
          :style="{
            padding: '20px',
          }"
        >
          <div v-html="markedRender(outputContent)"></div>
        </div>
      </ElScrollbar>
      <ChatAction @new-chat="newChat" />
    </div>
  </slot>

  <slot name="drawer">
    <DrawerPromptInitialize
      v-model:feature="currentFeature"
      v-model:visible="drawer"
      :form-data="formDataVariableSchema"
      :feature-id="currentFeatureId"
      :feature-mode="currentFeatureMode"
      @run="handleStartGenerateResponse"
      @close="handleCloseDrawer"
    ></DrawerPromptInitialize>
  </slot>
</template>

<script setup lang="ts">
import { ref, watch, Ref, computed, PropType } from "vue";
import { ElButton } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElScrollbar } from "element-plus";
import { ElMessage } from "element-plus";
import { ElTooltip } from "element-plus";
import { Icon } from "@iconify/vue";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { featureModeEnum } from "@/types";
import { FeatureType } from "@/lib/features";
import { ChainBuilder } from "@/lib/chain/chain_builder";
import { CWException } from "@/types/exception";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { FeatureSchema } from "@/lib/features";
import { Status } from "@/constants/status";
import { useChatDialogStore } from "@/store/chat_dialog";
import { ChatAction } from "@/components/Chat";
import { DrawerPromptInitialize } from "@/components";
import { consoleLog, LogLevelEnum } from "@/utils";
import { useUserSettingsStore } from "@/store/user_settings";
import { ConversationModeEnum } from "@/types/conversation";
import { LLM } from "@/lib/llm";
import {
  AIMode,
  AI_SYSTEM_RESPONSE_END_BLOCK,
  AI_SYSTEM_RESPONSE_START_BLOCK,
} from "@/constants";
import { ResponseParser } from "@/lib/response_parser";
import { SystemVariableParser } from "@/lib";

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

const props = defineProps({
  start: {
    type: Boolean,
    required: true,
    default: false,
  },
  featureMode: {
    type: String as PropType<featureModeEnum>,
    required: true,
    validator: (value: string) =>
      Object.values(featureModeEnum).includes(value as featureModeEnum),
  },
  featureSchema: {
    type: Object as PropType<FeatureSchema>,
    required: true,
    default: {},
  },
});

const emits = defineEmits([
  "update:start",
  "drawer",
  "close",
  "data",
  "complete",
]);

const chatDialog = useChatDialogStore();
const userSettings = useUserSettingsStore();

const aiProvider = computed(() => userSettings.getAiProvider);
const aiProviderKey = computed(() => {
  if (userSettings.getAiProvider === AIMode.CHAT_GPT) {
    return "ChatGPT";
  } else if (userSettings.getAiProvider === AIMode.BARD) {
    return "Bard";
  }
  return "ChatGPT";
});

const contentRef: Ref<HTMLDivElement> = ref(null as any);
const width = ref(0);
const outputContent = ref("");
const scrollContentRef = ref<InstanceType<typeof ElScrollbar>>();
const contentMaxHeight = ref(500);
const isStreaming = ref(false);
const drawer = ref(false);
const formDataVariableSchema = ref<{ [key: string]: string }>({});
const currentFeature: Ref<FeatureType> = ref({} as FeatureType);
const currentFeatureId: Ref<string> = ref("");
const currentFeatureMode: Ref<featureModeEnum> = ref(
  featureModeEnum.READONLY_CONTEXT_MENU
);

const llm = new LLM();

let conversationId: string | null = null;
let messageId: string | null = null;

watch(
  () => props.start,
  (value) => {
    isStreaming.value = value;
  }
);

watch(
  () => isStreaming.value,
  (value) => {
    emits("update:start", value);
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
  () => drawer.value,
  (newValue) => {
    if (newValue) {
      emits("drawer");
    }
  }
);

watch(
  () => props.start,
  (value) => {
    if (value) {
      handleFeature(
        props.featureSchema.id,
        props.featureSchema[props.featureMode]!,
        props.featureMode
      );
    }
  }
);

const markedRender = (text: string) => {
  return marked.parse(text);
};

const scrollToBottom = () => {
  scrollContentRef.value!.setScrollTop(contentRef.value!.clientHeight);
};

const handleRegenerate = () => {
  if (isStreaming.value) {
    return;
  }
  drawer.value = false;
  isStreaming.value = true;
};

const handleCopyToClipboard = () => {
  consoleLog(LogLevelEnum.DEBUG, "handleCopyToClipboard");
  if (outputContent.value) {
    navigator.clipboard.writeText(outputContent.value);
  }
};

const newChat = (value: string) => {
  let text = "";
  text += SystemVariableParser.getInstance().getSelectedText() + "\n";
  text += "\\-\\-\\-\n";
  text += outputContent.value + "\n";
  text += "\\-\\-\\-\n";
  text += value + "\n";
  chatDialog.setInitialPrompt(text);
  chatDialog.setChatDialogVisible(true);
  emits("close");
};

const startGenerateResponse = async (variables: { [key: string]: string }) => {
  isStreaming.value = true;
  const chainBuilder = new ChainBuilder(
    llm,
    currentFeature.value[aiProviderKey.value]!.Chains
  );
  consoleLog(LogLevelEnum.DEBUG, variables);
  for (const key in variables) {
    const storageKey = `FEATURE:${currentFeatureId.value}:${currentFeatureMode.value}:variable:${key}`;
    consoleLog(LogLevelEnum.DEBUG, storageKey);
    await ChromeStorage.getInstance().set(storageKey, variables[key]);
  }
  await chainBuilder.buildChains(variables);
  const result = await chainBuilder.executeChains(true, {
    aiProvider: aiProvider.value,
    conversationId: conversationId!,
    messageId: messageId!,
    conversationMode: ConversationModeEnum.NORMAL,
    deleteConversation: true,
  });

  outputContent.value = "";
  result.on("data", (data: string) => {
    emits("data", data);
    outputContent.value += data;
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
    let extractText = ResponseParser.getInstance().extractTextFromBlock(
      AI_SYSTEM_RESPONSE_START_BLOCK,
      AI_SYSTEM_RESPONSE_END_BLOCK,
      data.message
    );
    if (extractText) {
      outputContent.value = extractText;
    } else {
      outputContent.value = data.message;
    }
    emits("complete", outputContent.value);
    scrollToBottom();
    width.value = 700;
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
  type: featureModeEnum
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
  }
}

const handleStartGenerateResponse = (formDataVariableSchema: {
  [key: string]: string;
}) => {
  startGenerateResponse(formDataVariableSchema);
};

const handleCloseDrawer = () => {
  isStreaming.value = false;
  emits("close");
};
</script>

<style scoped></style>

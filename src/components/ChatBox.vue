<template>
  <div class="chatbox-container">
    <div class="chatbox-header">
      <div>
        CreMind AI
        <LoadImg :filename="'CreMind-logo-64.png'" :width="25" />
      </div>
      <div style="margin-left: auto; margin-right: 66px">
        <ElButtonGroup>
          <ElTooltip :hide-after="0" content="New conversation" placement="top">
            <ElButton plain @click="handleNewConversation">
              <Icon
                icon="gridicons:reader-follow-conversation"
                :style="{ fontSize: '20px' }"
              />
            </ElButton>
          </ElTooltip>
          <ElTooltip
            v-if="conversationContext.messageId"
            :hide-after="0"
            content="Regenerate response"
            placement="top"
          >
            <ElButton plain @click="handleRegenerateConversation">
              <Icon icon="ion:reload" :style="{ fontSize: '20px' }" />
            </ElButton>
          </ElTooltip>
          <ElTooltip
            :hide-after="0"
            content="Save this conversation"
            placement="top"
          >
            <ElButton plain @click="handleSaveConversation">
              <Icon
                icon="fluent:save-28-regular"
                :style="{ fontSize: '20px' }"
              />
            </ElButton>
          </ElTooltip>
          <ElTooltip
            :hide-after="0"
            v-if="conversationContext.endTurn === false"
            content="Continue generating"
            placement="top"
          >
            <ElButton plain @click="handleContinueGenerating">
              <Icon
                icon="pepicons-print:next-track"
                :style="{ fontSize: '20px' }"
              />
            </ElButton>
          </ElTooltip>
          <ElTooltip
            v-if="isStreaming"
            :hide-after="0"
            content="Stop generating"
            placement="top"
          >
            <ElButton plain @click="handleStopGenerating">
              <Icon icon="ph:stop-duotone" :style="{ fontSize: '20px' }" />
            </ElButton>
          </ElTooltip>
        </ElButtonGroup>
      </div>
    </div>
    <div class="chatbox-chat">
      <Chat
        ref="chatRef"
        :chats="chats"
        @new-chat="newChat"
        v-model:blockSend="isStreaming"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  reactive,
  Ref,
  ref,
  watch,
  onUnmounted,
  PropType,
} from "vue";
import { Icon } from "@iconify/vue";
import { ElButton, ElMessageBox } from "element-plus";
import { ElTooltip } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElMessage } from "element-plus";
import { AIMode, ConversationRoleEnum } from "@/constants";
import { Chat } from "./Chat";
import { useUserSettingsStore } from "@/store/user_settings";
import { PromptTemplate } from "@/lib/prompt_template";
import { Chain } from "@/lib/chain";
import { CMException } from "@/types/exception";
import { LLM } from "@/lib/llm";
import { Status } from "@/constants/status";
import {
  ConversationContextType,
  ConversationMessageType,
  ConversationModeEnum,
} from "@/types/conversation";
import { LoadImg } from "@/components";

const props = defineProps({
  isSend: {
    type: Boolean,
    required: false,
    default: false,
  },
  prompt: {
    type: String,
    required: false,
    default: "",
  },
  isStreaming: {
    type: Boolean,
    required: false,
    default: false,
  },
  chats: {
    type: Array as () => ConversationMessageType[],
    required: false,
    default: [],
  },
  conversationContext: {
    type: Object as PropType<ConversationContextType>,
    required: false,
    default: {
      conversationId: null,
      messageId: null,
      childMessageId: null,
      contextIds: [],
      endTurn: true,
      saveConversation: false,
      currentPrompt: null,
    },
  },
});

const emits = defineEmits([
  "update:isStreaming",
  "update:conversationContext",
  "update:chats",
  "data",
  "complete",
  "error",
]);

const userSettings = useUserSettingsStore();

const chatRef = ref<ComponentRef<typeof Chat>>();
let chats: ConversationMessageType[] = reactive(props.chats);
let conversationContext: ConversationContextType = reactive(
  props.conversationContext
);
const isStreaming = ref(props.isStreaming);
const aiProvider = computed(() => userSettings.getAiProvider);

const llm = new LLM();

watch(
  () => props.isSend,
  (value) => {
    if (value && props.prompt !== "") {
      sendMessage(props.prompt, ConversationModeEnum.NORMAL);
    }
  }
);

watch(
  () => props.isStreaming,
  (value) => {
    isStreaming.value = value;
  }
);

watch(
  () => isStreaming.value,
  (value) => {
    emits("update:isStreaming", value);
  }
);

watch(
  () => props.conversationContext,
  (value) => {
    conversationContext = value;
  }
);

/* TODO
watch(
  () => conversationContext,
  (value) => {
    emits("update:conversationContext", value);
  }
);

watch(chats, (value, _) => {
  emits("update:chats", value);
});
*/

const deleteConversation = () => {
  if (conversationContext.saveConversation) {
    conversationContext.saveConversation = false;
    return;
  }
  console.log(
    "onDeleteConversation",
    conversationContext.conversationId
  );
  llm.deleteConversation({
    aiProvider: aiProvider.value,
    conversationId: conversationContext.conversationId!,
  });
  chats.splice(0, chats.length);

  conversationContext.conversationId = null;
  conversationContext.messageId = null;
  isStreaming.value = false;
};

async function stopGenerating(): Promise<string> {
  if (isStreaming.value) {
    isStreaming.value = false;
    const resData = await llm.stopGenerating();
    return resData.conversationId;
  } else {
    return conversationContext.conversationId!;
  }
}

function close() {
  deleteConversation();
}

const sendMessage = async (
  prompt: string,
  conversationMode: ConversationModeEnum
) => {
  isStreaming.value = true;
  conversationContext.endTurn = true;
  conversationContext.currentPrompt = prompt;
  if (conversationMode === ConversationModeEnum.NORMAL) {
    chats.push({
      role: ConversationRoleEnum.USER,
      text: prompt,
    });
    chats.push({
      role: ConversationRoleEnum.ASSISTANT,
      text: "",
    });
  }

  const promptTemplate = new PromptTemplate(prompt);
  const chain = new Chain(
    "Conversation",
    llm,
    promptTemplate,
    null,
    null,
    null,
    true
  );
  const modelName =
    aiProvider.value === AIMode.CHAT_GPT ? userSettings.getChatgptModel : "";
  const result = await chain.execute(true, {
    aiProvider: aiProvider.value,
    modelName: modelName,
    conversationId: conversationContext.conversationId!,
    messageId: conversationContext.messageId!,
    contextIds: conversationContext.contextIds,
    conversationMode: conversationMode,
    ...(conversationMode === ConversationModeEnum.REGENERATE && {
      childMessageId: conversationContext.childMessageId!,
    }),
    deleteConversation: false,
  });

  let waiting = "";
  nextTick(() => {
    chatRef.value?.scrollToBottom();
  });
  const intervalId = setInterval(() => {
    if (waiting.length > 3) {
      waiting = ".";
    } else {
      waiting += ".";
    }
    chats[chats.length - 1] = {
      role: ConversationRoleEnum.ASSISTANT,
      text: waiting,
    };
    nextTick(() => {
      chatRef.value?.scrollToBottom();
    });
  }, 500);

  result.on("data", (data: string) => {
    clearInterval(intervalId);
    chats[chats.length - 1] = {
      role: ConversationRoleEnum.ASSISTANT,
      text: data,
    };
    nextTick(() => {
      chatRef.value?.scrollToBottom();
    });
    emits("data", data);
  });

  result.on("complete", (data: any) => {
    console.log("complete");
  });

  result.on("endOfChain", (data: any) => {
    isStreaming.value = false;
    console.log("endOfChain");
    clearInterval(intervalId);
    chats[chats.length - 1] = {
      role: ConversationRoleEnum.ASSISTANT,
      text: data.message,
    };
    conversationContext.conversationId = data.conversationId;
    conversationContext.messageId = data.messageId ? data.messageId : null;
    conversationContext.childMessageId = data.childMessageId
      ? data.childMessageId
      : null;
    conversationContext.contextIds = data.contextIds ? data.contextIds : null;
    conversationContext.endTurn = data.endTurn ? data.endTurn : null;
    nextTick(() => {
      chatRef.value?.scrollToBottom();
    });
    emits("complete", data.message);
  });

  result.on("error", (error: CMException) => {
    console.log("error");
    clearInterval(intervalId);
    isStreaming.value = false;
    conversationContext.endTurn = true;
    console.log(error);
    // if (error.code === Status.CHATGPT_UNAUTHORIZED) {
    //   ElMessage.error(
    //     "ChatGPT still not logged in yet. Please login and try again. 👉 https://chat.openai.com/"
    //   );
    // } else
    if (error.code === Status.IPC_RESPONSE_TIMEOUT) {
      // ElMessage.error(
      //   "ChatGPT is not responding. Please try again later or refresh the page. 👉 https://chat.openai.com/"
      // );
    } else if (error.code === Status.CHATGPT_RESPONSE_ERROR) {
      ElMessage.error(`ChatGPT: ${error.message}`);
    } else {
      ElMessage.error(error.message);
    }
    emits("error");
  });
};

const handleNewConversation = () => {
  if (isStreaming.value) {
    ElMessageBox.alert(
      "You cannot create a new conversation because the response is being processed",
      "Warning",
      {
        confirmButtonText: "OK",
        callback: () => {},
      }
    );
    return;
  }
  deleteConversation();
};

const handleRegenerateConversation = () => {
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
  if (conversationContext.currentPrompt) {
    sendMessage(
      conversationContext.currentPrompt,
      ConversationModeEnum.REGENERATE
    );
  }
};

const handleSaveConversation = () => {
  conversationContext.saveConversation = true;
};

const handleContinueGenerating = async () => {
  sendMessage("", ConversationModeEnum.CONTINUE);
};

const handleStopGenerating = async () => {
  isStreaming.value = false;
  const resData = await llm.stopGenerating();
  conversationContext.conversationId = resData.conversationId;
};

const newChat = (value: string) => {
  console.log("newChat", value);
  if (!isStreaming.value) {
    sendMessage(value, ConversationModeEnum.NORMAL);
  }
  nextTick(() => {
    chatRef.value?.scrollToBottom();
  });
};

onMounted(() => {
  console.log("Mounted ChatBox");
  isStreaming.value = props.isStreaming;
});

onUnmounted(() => {});
defineExpose({
  close,
  deleteConversation,
  stopGenerating,
});
</script>
<style scoped></style>

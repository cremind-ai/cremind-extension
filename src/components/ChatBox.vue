<template>
  <div class="chatbox-container">
    <div class="chatbox-header">
      <div>
        CreMind AI
        <LoadImg :filename="'CreMind-logo-64.png'" :width="25" />
      </div>
      <div style="margin-left: auto; margin-right: 66px">
        <ElButtonGroup>
          <ElTooltip
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
            v-if="endTurn === false"
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
          <!-- <ElTooltip :hide-after="0" content="Stop generating" placement="top">
                <ElButton plain @click="handleStopGenerating">
                  <Icon icon="ph:stop-duotone" :style="{ fontSize: '20px' }" />
                </ElButton>
              </ElTooltip> -->
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
import { computed, nextTick, onMounted, reactive, Ref, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { ElButton } from "element-plus";
import { ElTooltip } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElMessage } from "element-plus";
import { ConversationRoleEnum } from "@/constants";
import { Chat } from "./Chat";
import { useUserSettingsStore } from "@/store/user_settings";
import { useConversationStore } from "@/store/conversation";
import { PromptTemplate } from "@/lib/prompt_template";
import { Chain } from "@/lib/chain";
import { CWException } from "@/types/exception";
import { LLM } from "@/lib/llm";
import { consoleLog, LogLevelEnum } from "@/utils";
import { Status } from "@/constants/status";
import { ConversationModeEnum } from "@/types/conversation";
import { LoadImg } from "@/components";

const props = defineProps({
  isSend: {
    type: Boolean,
    required: true,
    default: false,
  },
  prompt: {
    type: String,
    required: true,
    default: "",
  },
  isStreaming: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits(["update:isStreaming", "complete"]);

const userSettings = useUserSettingsStore();
const conversation = useConversationStore();

const chatRef = ref<ComponentRef<typeof Chat>>();
const chats = computed(() => conversation.getConversations);
let conversationId: string | null = null;
let messageId: string | null = null;
let childMessageId: string | null = null;
let contextIds: string[][] = [];
let endTurn: Ref<boolean> = ref(true);
let saveConversation = false;
let currentPrompt: string | null = null;
const isStreaming = ref(false);
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
  () => isStreaming.value,
  (value) => {
    emits("update:isStreaming", value);
  }
);

const deleteConversation = () => {
  if (saveConversation) {
    saveConversation = false;
    return;
  }
  consoleLog(LogLevelEnum.DEBUG, "onDeleteConversation", conversationId);
  llm.deleteConversation({
    aiProvider: aiProvider.value,
    conversationId: conversationId!,
  });
  conversation.setConversations([]);
  conversationId = null;
  messageId = null;
  isStreaming.value = false;
};

function close() {
  deleteConversation();
}

const sendMessage = async (
  prompt: string,
  conversationMode: ConversationModeEnum
) => {
  isStreaming.value = true;
  endTurn.value = true;
  currentPrompt = prompt;
  if (conversationMode === ConversationModeEnum.NORMAL) {
    conversation.addingNewMessage({
      role: ConversationRoleEnum.USER,
      text: prompt,
    });
    conversation.addingNewMessage({
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
  const result = await chain.execute(true, {
    aiProvider: aiProvider.value,
    conversationId: conversationId!,
    messageId: messageId!,
    contextIds: contextIds,
    conversationMode: conversationMode,
    ...(conversationMode === ConversationModeEnum.REGENERATE && {
      childMessageId: childMessageId!,
    }),
    deleteConversation: false,
  });

  let response =
    conversationMode === ConversationModeEnum.CONTINUE
      ? chats.value[chats.value.length - 1].text
      : "";

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
    conversation.updateLastMessage({
      role: ConversationRoleEnum.ASSISTANT,
      text: waiting,
    });
  }, 500);

  result.on("data", (data: string) => {
    clearInterval(intervalId);
    consoleLog(LogLevelEnum.DEBUG, data);
    response += data;
    conversation.updateLastMessage({
      role: ConversationRoleEnum.ASSISTANT,
      text: response,
    });
    nextTick(() => {
      chatRef.value?.scrollToBottom();
    });
  });

  result.on("complete", (data: any) => {
    consoleLog(LogLevelEnum.DEBUG, "complete");
  });

  result.on("endOfChain", (data: any) => {
    consoleLog(LogLevelEnum.DEBUG, "endOfChain");
    clearInterval(intervalId);
    conversation.updateLastMessage({
      role: ConversationRoleEnum.ASSISTANT,
      text: data.message,
    });
    isStreaming.value = false;
    conversationId = data.conversationId;
    messageId = data.messageId ? data.messageId : null;
    childMessageId = data.childMessageId ? data.childMessageId : null;
    contextIds = data.contextIds ? data.contextIds : null;
    endTurn.value = data.endTurn ? data.endTurn : null;
    nextTick(() => {
      chatRef.value?.scrollToBottom();
    });
  });

  result.on("error", (error: CWException) => {
    consoleLog(LogLevelEnum.DEBUG, "error");
    clearInterval(intervalId);
    isStreaming.value = false;
    endTurn.value = true;
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

const handleRegenerateConversation = () => {
  if (currentPrompt) {
    sendMessage(currentPrompt, ConversationModeEnum.REGENERATE);
  }
};

const handleSaveConversation = () => {
  saveConversation = true;
};

const handleContinueGenerating = async () => {
  sendMessage("", ConversationModeEnum.CONTINUE);
};

const handleStopGenerating = async () => {
  isStreaming.value = false;
  const resData = await llm.stopGenerating();
  conversationId = resData.conversationId;
};

const newChat = (value: string) => {
  consoleLog(LogLevelEnum.DEBUG, "newChat", value);
  if (!isStreaming.value) {
    sendMessage(value, ConversationModeEnum.NORMAL);
  }
  nextTick(() => {
    chatRef.value?.scrollToBottom();
  });
};

onMounted(async () => {});
defineExpose({
  close,
});
</script>
<style scoped></style>

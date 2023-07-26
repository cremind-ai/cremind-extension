<template>
  <ElDialog
    v-model="chatDialogVisible"
    :width="`50%`"
    draggable
    :before-close="handleCloseDialog"
  >
    <template #header>
      <div
        style="
          white-space: nowrap;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          font-size: 16px;
        "
      >
        <div>cWord AI</div>
        <div style="margin-left: auto; margin-right: 20px">
          <ElButtonGroup>
            <ElTooltip content="Regenerate response" placement="top">
              <ElButton plain @click="handleRegenerateConversation">
                <Icon icon="ion:reload" :style="{ fontSize: '20px' }" />
              </ElButton>
            </ElTooltip>
            <ElTooltip content="Save this conversation" placement="top">
              <ElButton plain @click="handleSaveConversation">
                <Icon
                  icon="fluent:save-28-regular"
                  :style="{ fontSize: '20px' }"
                />
              </ElButton>
            </ElTooltip>
            <ElTooltip content="Stop generating" placement="top">
              <ElButton plain @click="handleStopGenerating">
                <Icon icon="ph:stop-duotone" :style="{ fontSize: '20px' }" />
              </ElButton>
            </ElTooltip>
          </ElButtonGroup>
        </div>
      </div>
    </template>
    <Chat
      ref="chatRef"
      :chats="chats"
      @new-chat="newChat"
      v-model:blockSend="isStreaming"
    />
  </ElDialog>
  <div class="button-chatting">
    <Icon
      icon="fluent:chat-12-filled"
      :style="{ fontSize: '50px' }"
      @click="onStartChatBox"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { ElButton } from "element-plus";
import { ElTooltip } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElDialog } from "element-plus";
import { ElMessageBox } from "element-plus";
import { ConversationRoleEnum } from "../constants";
import { Chat } from "./Chat";
import { useConversationStore } from "../store/conversation";
import { useChatDialogStore } from "../store/chat_dialog";
import { PromptTemplate } from "../lib/prompt_template";
import { Chain } from "../lib/chain";
import { CWException } from "../types/exception";
import { LLM } from "../lib/llm";
import { consoleLog, LogLevelEnum } from "../utils";

const conversation = useConversationStore();
const chatDialog = useChatDialogStore();

const chatRef = ref<ComponentRef<typeof Chat>>();
const chatDialogVisible = ref(false);
const chats = computed(() => conversation.getConversations);
let conversationId: string | null = null;
let messageId: string | null = null;
let childMessageId: string | null = null;
let saveConversation = false;
let currentPrompt: string | null = null;
const isStreaming = ref(false);
const llm = new LLM();

watch(
  () => chatDialog.getChatDialogVisible,
  (value) => {
    chatDialogVisible.value = value;
    const prompt = chatDialog.getInitialPrompt;
    if (value && prompt) {
      sendMessage(prompt!, false);
    }
  }
);

const sendMessage = async (prompt: string, regenerate: boolean) => {
  isStreaming.value = true;
  currentPrompt = prompt;
  if (!regenerate) {
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
    conversationId: conversationId,
    messageId: messageId,
    ...(regenerate && {
      childMessageId: childMessageId,
    }),
    deleteConversation: false,
    regenerate: regenerate,
  });

  let response = "";
  result.on("data", (data: string) => {
    consoleLog(LogLevelEnum.DEBUG, data);
    response += data;
    conversation.updateLastMessage({
      role: ConversationRoleEnum.ASSISTANT,
      text: response,
    });
    chatRef.value?.scrollToBottom();
  });

  result.on("complete", (data: any) => {
    consoleLog(LogLevelEnum.DEBUG, "complete");
  });

  result.on("endOfChain", (data: any) => {
    consoleLog(LogLevelEnum.DEBUG, "endOfChain");
    isStreaming.value = false;
    consoleLog(LogLevelEnum.DEBUG, data);
    conversationId = data.conversationId;
    messageId = data.messageId;
    childMessageId = data.childMessageId;
    conversation.updateLastMessage({
      role: ConversationRoleEnum.ASSISTANT,
      text: data.message,
    });
  });

  result.on("error", (err: CWException) => {
    consoleLog(LogLevelEnum.DEBUG, "error");
    isStreaming.value = false;
    consoleLog(LogLevelEnum.DEBUG, err);
  });

  chatDialog.setInitialPrompt(null);
};

const handleRegenerateConversation = () => {
  if (currentPrompt) {
    sendMessage(currentPrompt, true);
  }
};

const deleteConversation = () => {
  if (saveConversation) {
    saveConversation = false;
    return;
  }
  consoleLog(LogLevelEnum.DEBUG, "onDeleteConversation", conversationId);
  llm.deleteConversation({
    conversationId: conversationId!,
  });
  conversation.setConversations([]);
  conversationId = null;
  messageId = null;
};

const onStartChatBox = async () => {
  chatDialog.setChatDialogVisible(true);
};

const handleSaveConversation = () => {
  saveConversation = true;
};

const handleStopGenerating = async () => {
  isStreaming.value = false;
  const resData = await llm.stopGenerating();
  conversationId = resData.conversationId;
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
        chatDialogVisible.value = true;
        isStreaming.value = false;
        const resData = await llm.stopGenerating();
        conversationId = resData.conversationId;
      })
      .catch(() => {});
  } else {
    isStreaming.value = false;
    deleteConversation();
    chatDialog.setChatDialogVisible(false);
  }
};

const newChat = (value: string) => {
  consoleLog(LogLevelEnum.DEBUG, "newChat", value);
  chatRef.value?.scrollToBottom();
  sendMessage(value, false);
};

onMounted(() => {});
</script>
<style scoped>
.button-chatting {
  position: fixed;
  right: 5px;
  bottom: 100px;
  opacity: 0.4;
  z-index: 99999;
}
.button-chatting:hover {
  font-weight: bold;
  opacity: 1;
}
</style>

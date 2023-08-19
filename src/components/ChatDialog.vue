<template>
  <!-- Chat Dialog -->
  <ElDialog
    v-model="chatDialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :width="`50%`"
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
        <div style="margin-left: auto; margin-right: 26px">
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
            <ElTooltip
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
            <!-- <ElTooltip content="Stop generating" placement="top">
                <ElButton plain @click="handleStopGenerating">
                  <Icon icon="ph:stop-duotone" :style="{ fontSize: '20px' }" />
                </ElButton>
              </ElTooltip> -->
          </ElButtonGroup>
        </div>
      </div>
    </template>
    <!-- Chat component -->
    <Chat
      ref="chatRef"
      :chats="chats"
      @new-chat="newChat"
      v-model:blockSend="isStreaming"
    />
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, Ref, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { Close } from "@element-plus/icons-vue";
import { SemiSelect } from "@element-plus/icons-vue";
import { ElButton } from "element-plus";
import { ElTooltip } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElDialog } from "element-plus";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { ConversationRoleEnum } from "@/constants";
import { Chat } from "./Chat";
import { LoadImg } from ".";
import { useConversationStore } from "@/store/conversation";
import { useChatDialogStore } from "@/store/chat_dialog";
import { PromptTemplate } from "@/lib/prompt_template";
import { Chain } from "@/lib/chain";
import { CWException } from "@/types/exception";
import { LLM } from "@/lib/llm";
import { consoleLog, LogLevelEnum } from "@/utils";
import { Status } from "@/constants/status";
import { ConversationModeEnum } from "@/types/conversation";

const conversation = useConversationStore();
const chatDialog = useChatDialogStore();

const chatRef = ref<ComponentRef<typeof Chat>>();
const chatDialogVisible = ref(false);
const chats = computed(() => conversation.getConversations);
let conversationId: string | null = null;
let messageId: string | null = null;
let childMessageId: string | null = null;
let endTurn: Ref<boolean> = ref(true);
let saveConversation = false;
let currentPrompt: string | null = null;
const isStreaming = ref(false);
const isMinimized = ref(false);
const llm = new LLM();

watch(
  () => chatDialog.getChatDialogVisible,
  (value) => {
    chatDialogVisible.value = value;
    const prompt = chatDialog.getInitialPrompt;
    if (value && prompt) {
      sendMessage(prompt!, ConversationModeEnum.NORMAL);
    }
    if (value && isMinimized.value) {
      isMinimized.value = false;
    }
  }
);

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
    conversationId: conversationId,
    messageId: messageId,
    conversationMode: conversationMode,
    ...(conversationMode === ConversationModeEnum.REGENERATE && {
      childMessageId: childMessageId,
    }),
    deleteConversation: false,
  });

  let response =
    conversationMode === ConversationModeEnum.CONTINUE
      ? chats.value[chats.value.length - 1].text
      : "";
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
    endTurn.value = data.endTurn;
  });

  result.on("error", (error: CWException) => {
    consoleLog(LogLevelEnum.DEBUG, "error");
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

  chatDialog.setInitialPrompt(null);
};

const handleRegenerateConversation = () => {
  if (currentPrompt) {
    sendMessage(currentPrompt, ConversationModeEnum.REGENERATE);
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

const handleSaveConversation = () => {
  saveConversation = true;
};

const handleContinueGenerating = async () => {
  // await llm.continueGenerating();
  sendMessage("", ConversationModeEnum.CONTINUE);
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
        chatDialog.setChatDialogVisible(true);
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
  if (!isStreaming.value) {
    sendMessage(value, ConversationModeEnum.NORMAL);
  }
};

const handleMinimize = () => {
  isMinimized.value = true;
  chatDialog.setChatDialogVisible(false);
};

onMounted(() => {});
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
</style>

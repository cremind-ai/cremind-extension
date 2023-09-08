<template>
  <!-- Chat Dialog -->
  <ElDialog
    v-model="chatDialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :width="`50%`"
    draggable
    :before-close="handleCloseDialog"
    class="chat-dialog-main"
  >
    <!-- Header -->
    <template #header>
      <ElButton
        class="chat-dialog-minimize-icon"
        type="warning"
        plain
        :icon="SemiSelect"
        @click="handleMinimize"
        size="small"
        circle
      ></ElButton>
      <ElButton
        class="chat-dialog-close-icon"
        type="danger"
        plain
        :icon="Close"
        @click="handleCloseDialog"
        size="small"
        circle
      ></ElButton>
      <ChatBox
        ref="chatBoxRef"
        v-model:is-streaming="isStreaming"
        :is-send="isSend"
        :prompt="prompt"
      ></ChatBox>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, Ref, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { Close } from "@element-plus/icons-vue";
import { SemiSelect } from "@element-plus/icons-vue";
import { ElButton } from "element-plus";
import { ElDialog } from "element-plus";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { useChatDialogStore } from "@/store/chat_dialog";
import { ChatBox } from "@/components";

const emits = defineEmits(["close"]);

const chatDialog = useChatDialogStore();

const chatBoxRef = ref<ComponentRef<typeof ChatBox>>();
const chatDialogVisible = ref(false);

const isStreaming = ref(false);
const isMinimized = ref(false);
const isSend = ref(false);
const prompt = ref("");

watch(
  () => chatDialog.getChatDialogVisible,
  (value) => {
    chatDialogVisible.value = value;
    if (value) {
      const _prompt = chatDialog.getInitialPrompt;
      if (_prompt) {
        prompt.value = _prompt;
        nextTick(() => {
          isSend.value = true;
        });
      }
    }
    if (value && isMinimized.value) {
      isMinimized.value = false;
    }
  }
);

watch(
  () => isStreaming.value,
  (value) => {
    if (!value) {
      chatDialog.setInitialPrompt(null);
    }
  }
);

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
        chatDialog.setChatDialogVisible(true);
        isStreaming.value = false;
      })
      .catch(() => {});
  } else {
    chatDialog.setChatDialogVisible(false);
    chatBoxRef.value!.close();
    emits("close");
  }
};

const handleMinimize = () => {
  isMinimized.value = true;
  chatDialog.setChatDialogVisible(false);
  emits("close");
};

onMounted(async () => {});
</script>
<style scoped></style>

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
      <div class="chat-dialog-header"></div>
    </template>
    <div :style="{ height: dialogHeight }">
      <ChatBox
        ref="chatBoxRef"
        v-model:is-streaming="isStreaming"
        :is-send="isSend"
        :prompt="prompt"
      ></ChatBox>
    </div>
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
import { ChatBox } from "@/components";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
  prompt: {
    type: String,
    required: false,
    default: "",
  },
});

const emits = defineEmits(["close"]);

const chatBoxRef = ref<ComponentRef<typeof ChatBox>>();
const chatDialogVisible = ref(props.show);

const isStreaming = ref(false);
const isMinimized = ref(false);

const isSend = ref(false);

const dialogHeight = ref(`${(70 / 100) * window.innerHeight}px`);

watch(
  () => props.show,
  (newValue) => {
    chatDialogVisible.value = newValue;
    if (newValue && props.prompt !== "") {
      nextTick(() => {
        isSend.value = true;
      });
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
        chatDialogVisible.value = true;
        isStreaming.value = false;
      })
      .catch(() => {});
  } else {
    chatDialogVisible.value = false;
    chatBoxRef.value!.close();
    isSend.value = false;
    setTimeout(() => {
      emits("close");
    }, 0);
  }
};

const handleMinimize = () => {
  isMinimized.value = true;
  chatDialogVisible.value = false;
  emits("close");
};

onMounted(async () => {});
</script>
<style scoped></style>

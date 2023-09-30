<template>
  <ElDialog
    v-model="promptDialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :width="660"
    draggable
    :before-close="handleCloseDialog"
    class="prompt-dialog-main"
  >
    <!-- Header -->
    <template #header>
      <ElButton
        class="prompt-dialog-minimize-icon"
        type="warning"
        plain
        :icon="SemiSelect"
        @click="handleMinimize"
        size="small"
        circle
      ></ElButton>
      <ElButton
        class="prompt-dialog-close-icon"
        type="danger"
        plain
        :icon="Close"
        @click="handleCloseDialog"
        size="small"
        circle
      ></ElButton>
      <div class="prompt-dialog-header"></div>
    </template>
    <div
      :style="{
        height: dialogHeight,
        paddingTop: '5px',
      }"
      class="prompt-dialog-app-container"
    >
      <PromptApp
        ref="promptAppRef"
        v-model:is-streaming="isStreaming"
        @new-chat="newChatEvent"
        @close="promptAppClose"
      ></PromptApp>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  PropType,
  reactive,
  Ref,
  ref,
  watch,
} from "vue";
import { Icon } from "@iconify/vue";
import { Close } from "@element-plus/icons-vue";
import { SemiSelect } from "@element-plus/icons-vue";
import { ElButton } from "element-plus";
import { ElDialog } from "element-plus";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { PromptApp } from "@/components";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
  isStreaming: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits(["update:isStreaming", "close", "newChat"]);

const promptAppRef = ref<ComponentRef<typeof PromptApp>>();
const promptDialogVisible = ref(props.show);

const isStreaming = ref(props.isStreaming);
const isMinimized = ref(false);

const dialogHeight = ref(`${(70 / 100) * window.innerHeight}px`);

watch(
  () => props.show,
  (newValue) => {
    promptDialogVisible.value = newValue;
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

function close() {
  promptAppRef.value!.close();
}

function promptAppClose() {
  emits("close");
}

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
        promptDialogVisible.value = true;
        isStreaming.value = false;
      })
      .catch(() => {});
  } else {
    promptDialogVisible.value = false;
    promptAppRef.value!.close();
    emits("close");
  }
};

const handleMinimize = () => {
  isMinimized.value = true;
  promptDialogVisible.value = false;
  emits("close");
};

function newChatEvent(value: string) {
  emits("newChat", value);
}

onMounted(async () => {});
defineExpose({
  close,
});
</script>
<style scoped></style>

<template>
  <!-- Chat Dialog -->
  <ElDialog
    v-model="appDialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :width="`80%`"
    :fullscreen="isMaximized"
    :before-close="handleCloseDialog"
  >
    <!-- Header -->
    <template #header>
      <ElButton
        class="apps-dialog-minimize-icon"
        type="warning"
        plain
        :icon="SemiSelect"
        @click="handleMinimize"
        size="small"
        circle
      ></ElButton>
      <ElButton
        class="apps-dialog-close-icon"
        type="danger"
        plain
        :icon="Close"
        @click="handleCloseDialog"
        size="small"
        circle
      ></ElButton>
      <ElButton
        class="apps-dialog-maximize-icon"
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
            class="apps-dialog-cremind-icon-bar"
            :filename="'CreMind-logo-64.png'"
            :width="25"
          />
        </div>
      </div>
    </template>
    <Apps
      ref="appsRef"
      :start="startApp"
      v-model:is-streaming="isStreaming"
      @complete="handleComplete"
    >
      <template #main />
      <template #drawer />
    </Apps>
    <!-- <template #footer>hello footer</template> -->
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, watch } from "vue";
import { Close } from "@element-plus/icons-vue";
import { FullScreen } from "@element-plus/icons-vue";
import { SemiSelect } from "@element-plus/icons-vue";
import { ElButton } from "element-plus";
import { ElDialog } from "element-plus";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { LoadImg } from ".";
import { Apps } from "@/components";

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

const emits = defineEmits(["update:modelValue", "close"]);

const appsRef = ref<ComponentRef<typeof Apps>>();
const appDialogVisible = ref(props.modelValue);
const isStreaming = ref(false);
const isMaximized = ref(false);
const isMinimized = ref(false);
const startApp = ref(false);

watch(
  () => props.modelValue,
  (value) => {
    appDialogVisible.value = value;
    if (value && !isMinimized.value) {
      startApp.value = true;
    }
  }
);

watch(
  () => appDialogVisible.value,
  (value) => {
    emits("update:modelValue", value);
  }
);

const close = () => {
  appsRef.value!.close();
  isMinimized.value = false;
  startApp.value = false;
  appDialogVisible.value = false;
  emits("close");
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
    close();
  }
};

const handleMinimize = () => {
  isMinimized.value = true;
  appDialogVisible.value = false;
  emits("close");
};

const handleMaximize = () => {
  if (isMaximized.value) {
    isMaximized.value = false;
  } else {
    isMaximized.value = true;
  }
};

const handleComplete = () => {
  startApp.value = false;
};

onMounted(() => {});
</script>
<style scoped></style>

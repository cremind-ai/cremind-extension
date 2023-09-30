<template>
  <!-- Custom Dialog -->
  <!-- appDialogVisible -->
  <div
    :class="{
      maximized: isMaximized && dialog,
      'custom-dialog': dialog && appDialogVisible,
    }"
    :style="{ display: appDialogVisible ? 'block' : 'none' }"
  >
    <!-- Header -->
    <div :class="{ 'custom-dialog-content': dialog }">
      <div
        v-if="dialog && appDialogVisible"
        :class="{ 'custom-dialog-header': dialog }"
      >
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
        <!-- <ElButton
          class="apps-dialog-maximize-icon"
          type="success"
          plain
          :icon="FullScreen"
          @click="handleMaximize"
          size="small"
          circle
        ></ElButton> -->
      </div>
      <div :class="{ 'custom-dialog-body': dialog }">
        <Apps
          ref="appsRef"
          :start="startApp"
          :max-height="appMaxHeight"
          v-model:is-streaming="isStreaming"
          v-model:drawer-show="drawerShow"
          v-model:conversation-id="conversationId"
          @complete="handleComplete"
        >
          <template #main />
          <template #drawer />
        </Apps>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, watch } from "vue";
import { Close } from "@element-plus/icons-vue";
import { FullScreen } from "@element-plus/icons-vue";
import { SemiSelect } from "@element-plus/icons-vue";
import { ElButton } from "element-plus";
import { ElCard } from "element-plus";
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
    required: false,
    default: false,
  },
  dialog: {
    type: Boolean,
    required: true,
    default: false,
  },
  isStreaming: {
    type: Boolean,
    required: false,
    default: false,
  },
  drawerShow: {
    type: Boolean,
    required: false,
    default: false,
  },
  conversationId: {
    type: String,
    required: false,
    default: "",
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

const emits = defineEmits([
  "update:modelValue",
  "update:isStreaming",
  "update:drawerShow",
  "update:conversationId",
  "close",
]);

const appMaxHeight = computed(() => {
  if (isMaximized.value) {
    return (95 / 100) * window.innerHeight;
  } else {
    return (80 / 100) * window.innerHeight;
  }
});
const appsRef = ref<ComponentRef<typeof Apps>>();
const appDialogVisible = ref(props.modelValue);
const isStreaming = ref(false);
const isMaximized = ref(true);
const isMinimized = ref(false);
const startApp = ref(false);
const drawerShow = ref(false);
const conversationId: Ref<string> = ref("");

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
  () => props.drawerShow,
  (value) => {
    drawerShow.value = value;
  }
);

watch(
  () => drawerShow.value,
  (value) => {
    emits("update:drawerShow", value);
  }
);

watch(
  () => props.conversationId,
  (value) => {
    conversationId.value = value;
  }
);

watch(
  () => conversationId.value,
  (value) => {
    emits("update:conversationId", value);
  }
);

const close = async () => {
  const closeStt = await appsRef.value!.close();
  if (closeStt) {
    isMinimized.value = false;
    startApp.value = false;
    appDialogVisible.value = false;
    setTimeout(() => {
      emits("close");
    }, 0);
  }
};

async function stopGenerating(): Promise<string> {
  return await appsRef.value!.stopGenerating();
}

const handleCloseDialog = async () => {
  close();
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
defineExpose({
  close,
  stopGenerating,
});
</script>
<style scoped></style>

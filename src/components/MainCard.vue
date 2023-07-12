<template>
  <ElPopover
    class="transparent-popover"
    placement="bottom"
    :visible="visible"
    :width="width"
    popper-style="background-image: linear-gradient(140deg, rgba(234, 222, 219, 0.4) 0%, rgba(188, 112, 164, 0.4) 50%, rgba(191, 214, 65, 0.4) 75%);"
  >
    <template #reference>
      <div
        class="option-bar"
        :style="{ top, left }"
        v-show="show"
        @click="visible = true"
      >
        <LoadImg class="cword-icon" :filename="'check64.png'" />
        <div v-if="isContentEditable">
          <ElButtonGroup>
            <ElButton type="success" plain>
              <Icon icon="ion:language-outline" :style="{ fontSize: '20px' }" />
            </ElButton>
            <ElButton type="success" plain>
              <Icon
                icon="fluent:text-grammar-checkmark-24-regular"
                :style="{ fontSize: '20px' }"
              />
            </ElButton>
            <ElButton type="success" plain>
              <Icon
                icon="streamline:programming-browser-code-2-code-browser-tags-angle-programming-bracket"
                :style="{ fontSize: '20px' }"
              />
            </ElButton>
          </ElButtonGroup>
        </div>
        <div v-else-if="!isContentEditable">
          <ElButtonGroup>
            <ElButton type="success" plain>
              <Icon icon="ion:language-outline" :style="{ fontSize: '20px' }" />
            </ElButton>
            <ElButton type="success" plain>
              <Icon
                icon="fluent:text-grammar-checkmark-24-regular"
                :style="{ fontSize: '20px' }"
              />
            </ElButton>
            <ElButton type="success" plain>
              <Icon
                icon="streamline:programming-browser-code-2-code-browser-tags-angle-programming-bracket"
                :style="{ fontSize: '20px' }"
              />
            </ElButton>
          </ElButtonGroup>
        </div>
      </div>
    </template>
    <div style="margin-right: 25px">cWord grammar correction</div>
    <div ref="contentRef">{{ selectedText }}</div>
    <ElButton
      class="card-close-icon"
      type="danger"
      plain
      :icon="Close"
      @click="handleClose"
      size="small"
      circle
    ></ElButton>
  </ElPopover>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, Ref } from "vue";
import { ElPopover } from "element-plus";
import { ElButton } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { Icon } from "@iconify/vue";
import { LoadImg } from ".";
import { IPCClient } from "../lib/ipc_client";
import { EventEmitter } from "../utils/event_emitter";
import {
  PromptTemplate,
  PromptTemplateException,
} from "../lib/prompt_template";
import { CWException } from "../types/exception";
import { Chain } from "../lib/chain";

const props = defineProps({
  selectedText: {
    type: String,
    required: true,
  },
  top: {
    type: String,
    required: true,
  },
  left: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
  isContentEditable: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits(["close"]);

const show = ref(props.show);
const visible = ref(false);
const optionBarRef: Ref<HTMLDivElement> = ref(null as any);
const popoverRef: Ref<HTMLDivElement> = ref(null as any);
const contentRef: Ref<HTMLDivElement> = ref(null as any);
const width = ref(300);

watch(
  () => props.show,
  (newValue) => {
    show.value = newValue;
    if (newValue === true) {
      startConversation("who are you?");
    }
  }
);

watch(
  () => props.selectedText,
  (newValue) => {
    const _width = contentRef.value.offsetWidth;
    width.value = _width;
  }
);

function handleClose() {
  console.log("handleClose");
  visible.value = false;
  setTimeout(() => {
    show.value = false;
    emits("close");
  }, 0);
}

const handleClickOutside = (event: MouseEvent) => {
  console.log("handleClickOutside");
  if (
    optionBarRef.value &&
    !optionBarRef.value.contains(event.target as Node) &&
    popoverRef.value &&
    !popoverRef.value.contains(event.target as Node) &&
    show.value
  ) {
    handleClose();
  }
};

const startConversation = async (prompt: string) => {};

/* Example
  chrome.runtime.sendMessage("Hi I'm here", (response) => {
    console.log("response", response);
  });
*/

onMounted(async () => {
  console.log("onMounted");
  optionBarRef.value = document.querySelector(".option-bar") as HTMLDivElement;
  popoverRef.value = document.querySelector(".el-popover") as HTMLDivElement;
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  console.log("onUnmounted");
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<style scoped>
.option-bar {
  position: fixed;
  z-index: 99999;
}

.card-close-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

.cword-icon {
  position: absolute;
  top: -22px;
  left: -20px;
}
</style>

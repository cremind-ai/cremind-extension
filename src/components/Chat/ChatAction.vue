<template>
  <div ref="chatActionRef" style="position: relative">
    <Icon
      class="chat-action-input-loading"
      icon="line-md:loading-twotone-loop"
      :style="{
        visibility: blockSend ? 'visible' : 'hidden',
      }"
    />
    <ElInput
      ref="inputRef"
      class="chat-action-w-full chat-action-px-2 chat-action-py-1 chat-action-rounded-xl"
      placeholder=""
      v-model="textField"
      :autosize="{ minRows: 2 }"
      type="textarea"
      show-word-limit
      style="padding: 0"
      :disabled="blockSend"
      @keydown.enter="handleEnterKey"
      @keydown="handleKey"
      @keyup="handleKey"
      @keypress="handleKey"
    />
    <span v-if="!blockSend" class="chat-action-send-icon">
      <ElTooltip
        :hide-after="0"
        content="Double Enter quickly = Send"
        placement="top"
      >
        <Icon
          icon="ep:promotion"
          :style="{ fontSize: '25px' }"
          @click="newChat"
        />
      </ElTooltip>
    </span>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ElInput } from "element-plus";
import { ElTooltip } from "element-plus";
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps({
  blockSend: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits(["new-chat", "update:modelValue", "mounted"]);

const textField = ref("");
const chatActionRef = ref<HTMLDivElement>();
const inputRef = ref<InstanceType<typeof ElInput>>();
const blockSend = ref(props.blockSend);
let lastEnterTime = 0;

watch(
  () => props.blockSend,
  (value) => {
    blockSend.value = value;
    if (!value) {
      inputRef.value!.focus();
    }
  }
);

const newChat = () => {
  if (!blockSend.value && textField.value.trim().length > 0) {
    emits("new-chat", textField.value.trim());
    nextTick(() => {
      textField.value = "";
    });
  }
};

const handleKey = (event: Event | KeyboardEvent) => {
  event.stopPropagation();
};

const handleEnterKey = () => {
  const currentTime = Date.now();
  if (currentTime - lastEnterTime < 200) {
    // Check if time between two Enter presses is less than 200ms
    newChat();
  }
  lastEnterTime = currentTime;
};

onMounted(() => {
  console.log("Mounted ChatAction");
  blockSend.value = props.blockSend;
  emits("mounted");
});
</script>

<style scoped></style>

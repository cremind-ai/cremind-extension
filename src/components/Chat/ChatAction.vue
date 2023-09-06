<template>
  <div style="position: relative">
    <ElInput
      class="chat-action-w-full chat-action-px-2 chat-action-py-1 chat-action-rounded-xl"
      placeholder=""
      v-model="textField"
      :autosize="{ minRows: 2 }"
      type="textarea"
      show-word-limit
      style="padding: 0"
      :disabled="blockSend"
      @keydown.enter="handleEnterKey"
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
import { nextTick, ref } from "vue";

const props = defineProps({
  blockSend: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits(["new-chat", "update:modelValue"]);

const textField = ref("");
let lastEnterTime = 0;

const newChat = () => {
  if (!props.blockSend && textField.value.trim().length > 0) {
    emits("new-chat", textField.value.trim());
    nextTick(() => {
      textField.value = "";
    });
  }
};

const handleEnterKey = () => {
  const currentTime = Date.now();
  if (currentTime - lastEnterTime < 200) {
    // Check if time between two Enter presses is less than 200ms
    newChat();
  }
  lastEnterTime = currentTime;
};
</script>

<style scoped></style>

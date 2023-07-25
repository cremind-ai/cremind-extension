<template>
  <div style="position: relative">
    <ElInput
      class="bg-secondary w-full px-2 py-1 rounded-xl"
      placeholder=""
      v-model="textField"
      :autosize="{ minRows: 2 }"
      type="textarea"
      show-word-limit
      style="padding: 0"
    />
    <span v-if="!blockSend" class="send-icon">
      <Icon
        icon="ep:promotion"
        :style="{ fontSize: '25px' }"
        @click="newChat"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ElInput } from "element-plus";
import { ref, watch } from "vue";

const props = defineProps({
  blockSend: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits(["new-chat", "update:modelValue"]);

const textField = ref("");

const newChat = () => {
  if (!props.blockSend && textField.value.trim().length > 0) {
    emits("new-chat", textField.value.trim());
    textField.value = "";
  }
};
</script>

<style scoped>
/* CSS style for the send-icon class */
.send-icon {
  position: absolute;
  bottom: 5px;
  right: 5px;
  opacity: 0.4;
}
.send-icon:hover {
  font-weight: bold;
  opacity: 1;
}
.w-full {
  width: 100%;
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.rounded-xl {
  border-radius: 0.75rem;
}
</style>

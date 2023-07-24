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
    <span class="send-icon">
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
import { ref } from "vue";

const emits = defineEmits(["new-chat"]);
const textField = ref("");

const newChat = () => {
  if (textField.value.split("").length > 0) {
    emits("new-chat", textField.value);
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
</style>

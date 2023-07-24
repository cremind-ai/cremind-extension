<template>
  <main class="w-full py-5 pb-20">
    <BallonChat
      v-for="(chat, index) in props.chats"
      :key="index"
      :is-left="chat.role === ConversationRoleEnum.ASSISTANT"
      :message="chat.text"
    />
  </main>
</template>

<script setup lang="ts">
import { ConversationRoleEnum } from "../../constants";
import { ConversationMessageType } from "../../types/conversation";
import { BallonChat } from "../Chat";
const props = defineProps({
  chats: {
    type: Array as () => ConversationMessageType[],
    required: true,
  },
});
</script>
<style scoped>
.w-full {
  width: 100%;
}
.py-5 {
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}
.pb-20 {
  padding-bottom: 5rem;
}
</style>

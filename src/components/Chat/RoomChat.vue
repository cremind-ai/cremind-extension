<template>
  <BallonChat
    v-for="(chat, index) in props.chats"
    :key="index"
    :is-left="chat.role === ConversationRoleEnum.ASSISTANT"
    :message="chat.text"
  />
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
<style scoped></style>

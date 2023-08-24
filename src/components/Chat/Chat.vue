<template>
  <ElScrollbar ref="scrollbarRef" :maxHeight="chatMaxHeight">
    <div ref="innerRef">
      <RoomChat :chats="props.chats" />
    </div>
  </ElScrollbar>
  <ChatAction @new-chat="newChat" v-model:blockSend="blockSend" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElScrollbar } from "element-plus";
import { RoomChat } from "../Chat";
import { ChatAction } from "../Chat";
import { ConversationMessageType } from "@/types/conversation";

const props = defineProps({
  chats: {
    type: Array as () => ConversationMessageType[],
    required: true,
  },
  blockSend: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits(["new-chat"]);

const innerRef = ref<HTMLDivElement>();
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const chatMaxHeight = ref(500);
const blockSend = ref(false);

watch(
  () => props.blockSend,
  (value) => {
    blockSend.value = value;
  }
);

const newChat = (value: string) => {
  emits("new-chat", value);
  scrollToBottom();
};

const scrollToBottom = () => {
  scrollbarRef.value!.setScrollTop(innerRef.value!.clientHeight);
};

onMounted(() => {
  scrollToBottom();
});

defineExpose({
  scrollToBottom,
});
</script>
<style scoped></style>

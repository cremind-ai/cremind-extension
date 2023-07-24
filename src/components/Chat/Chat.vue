<template>
  <ElScrollbar ref="scrollbarRef" :maxHeight="chatMaxHeight">
    <div ref="innerRef">
      <RoomChat :chats="props.chats" />
    </div>
  </ElScrollbar>
  <ChatAction @new-chat="newChat" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElScrollbar } from "element-plus";
import { RoomChat } from "../Chat";
import { ChatAction } from "../Chat";
import { ConversationMessageType } from "../../types/conversation";

const props = defineProps({
  chats: {
    type: Array as () => ConversationMessageType[],
    required: true,
  },
});

const emits = defineEmits(["new-chat"]);

const innerRef = ref<HTMLDivElement>();
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const chatMaxHeight = ref(500);

const newChat = (value: string) => {
  emits("new-chat", value);
  scrollToBottom();
};

const scrollToBottom = () => {
  scrollbarRef.value!.setScrollTop(innerRef.value!.clientHeight);
};

onMounted(() => {
  console.log(props.chats);
  scrollToBottom();
});

defineExpose({
  scrollToBottom,
});
</script>
<style scoped></style>

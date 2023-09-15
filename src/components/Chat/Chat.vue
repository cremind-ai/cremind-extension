<template>
  <div class="cremind-chat">
    <div class="cremind-chat-outer" ref="outerRef">
      <ElScrollbar
        ref="scrollbarRef"
        :maxHeight="scrollbarHeight"
        style="padding-left: 5px; padding-right: 5px"
      >
        <div ref="innerRef">
          <RoomChat :chats="chats" />
        </div>
      </ElScrollbar>
    </div>

    <component
      :is="chatActionComponent"
      style="padding: 5px"
      @new-chat="newChat"
      v-model:blockSend="blockSend"
      @mounted="chatActionMounted"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onMounted,
  Ref,
  ref,
  watch,
  nextTick,
} from "vue";
import { ElScrollbar } from "element-plus";
import { RoomChat } from "../Chat";
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

const emits = defineEmits(["new-chat", "height"]);

const innerRef = ref<HTMLDivElement>();
const outerRef = ref<HTMLDivElement>();
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const chatActionRef = ref<HTMLDivElement>();
const blockSend = ref(false);
const scrollbarHeight = ref(0);
const chats: Ref<ConversationMessageType[]> = ref([]);

watch(
  () => props.blockSend,
  (value) => {
    blockSend.value = value;
  }
);

watch(
  () => props.chats,
  (value) => {
    chats.value = value;
  }
);

const newChat = (value: string) => {
  emits("new-chat", value);
  scrollToBottom();
};

const scrollToBottom = () => {
  scrollbarRef.value!.setScrollTop(innerRef.value!.clientHeight);
};

const chatActionComponent = defineAsyncComponent(async () => {
  // Import ChatAction component asynchronously
  const module = await import("./ChatAction.vue");
  return module.default;
});

const chatActionMounted = () => {
  scrollbarHeight.value = outerRef.value!.clientHeight;
  chats.value = props.chats;
  nextTick(() => {
    scrollToBottom();
  });
};

onMounted(async () => {});

defineExpose({
  scrollToBottom,
});
</script>
<style scoped></style>

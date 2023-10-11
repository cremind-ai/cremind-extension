<template>
  <div class="cremind-chat">
    <div class="cremind-chat-outer" ref="outerRef">
      <ElScrollbar
        ref="scrollbarRef"
        :maxHeight="scrollbarHeight"
        style="padding-left: 5px; padding-right: 5px"
      >
        <div ref="innerRef">
          <RoomChat v-if="!initScrollbarHeight" :chats="chats" />
        </div>
      </ElScrollbar>
    </div>

    <div ref="chatActionRef">
      <component
        :is="chatActionComponent"
        style="padding: 5px"
        @new-chat="newChat"
        v-model:blockSend="blockSend"
        @mounted="chatActionMounted"
      />
    </div>
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
  reactive,
} from "vue";
import { ElScrollbar } from "element-plus";
import { RoomChat } from "../Chat";
import { ConversationMessageType } from "@/types/conversation";

const props = defineProps({
  chats: {
    type: Array as () => ConversationMessageType[],
    required: true,
    default: [],
  },
  blockSend: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits(["new-chat", "height"]);

const innerRef = ref<HTMLDivElement>();
const outerRef = ref<HTMLDivElement>();
const chatActionRef = ref<HTMLDivElement>();
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const blockSend = ref(props.blockSend);
const scrollbarHeight = ref(0);
const initScrollbarHeight = ref(true);
let chats: ConversationMessageType[] = reactive(props.chats);

let chatActionHeight = 0;

watch(
  () => props.blockSend,
  (value) => {
    blockSend.value = value;
    if (!value) {
      if (chatActionHeight === 0) {
        chatActionHeight = chatActionRef.value!.clientHeight;
        scrollbarHeight.value -= chatActionHeight;
      }
    }
  }
);

watch(props.chats, (value, _) => {
  chats = value;
  if (initScrollbarHeight.value && outerRef.value!.clientHeight !== 0) {
    scrollbarHeight.value =
      outerRef.value!.clientHeight + chatActionRef.value!.clientHeight;
    initScrollbarHeight.value = false;
  }
});

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
  scrollbarHeight.value -= chatActionRef.value!.clientHeight + 10;
};

onMounted(async () => {
  blockSend.value = props.blockSend;
});

defineExpose({
  scrollToBottom,
});
</script>
<style scoped></style>

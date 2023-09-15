<template>
  <main class="cremind-w-full">
    <div class="common" :class="isLeft ? '' : 'ballon-chat-flex-row-reverse'">
      <div style="display: flex" :style="{ 'max-width': bubbleMaxWidth }">
        <div
          :class="
            isLeft
              ? 'ballon-chat-rounded-bubble-left ballon-chat-bg-gray-600'
              : 'ballon-chat-rounded-bubble-right ballon-chat-bg-blue-800'
          "
          class="bubble ballon-chat-chat-message-content"
          v-html="outputContentRender"
        ></div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { computed } from "vue";

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);
marked.use({ silent: true, mangle: false, breaks: true });

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  isLeft: {
    type: Boolean,
    default: false,
  },
});

const outputContentRender = computed(() => {
  return marked.parse(props.message);
});

const bubbleMaxWidth = "calc(100% - 2.25rem)"; // Adjust the padding accordingly
</script>

<style scoped></style>

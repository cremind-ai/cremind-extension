<template>
  <main class="w-full">
    <div class="common" :class="isLeft ? '' : 'flex-row-reverse'">
      <div style="display: flex" :style="{ 'max-width': bubbleMaxWidth }">
        <div
          :class="
            isLeft
              ? 'rounded-bubble-left bg-gray-600'
              : 'rounded-bubble-right bg-blue-800'
          "
          class="bubble"
          v-html="markedRender(props.message)"
        ></div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);
marked.use({ silent: true, breaks: true });

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

const bubbleMaxWidth = "calc(100% - 2.25rem)"; // Adjust the padding accordingly

const markedRender = (text: string) => {
  return marked.parse(text);
};
</script>

<style scoped>
.w-full {
  width: 100%;
}
.common {
  margin-bottom: 1.25rem;
  display: flex;
}

.bubble {
  max-width: var(--bubble-max-width, calc(100% - 2.25rem));
  /* Adjust the padding and other styles accordingly */
  --tw-text-opacity: 1;
  color: rgb(243 244 246 / var(--tw-text-opacity));
  padding-left: 1.25rem;
  padding-right: 0.75rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  flex: 1 1 0%;
}

.flex-row-reverse {
  flex-direction: row-reverse;
}

.bg-gray-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(75 85 99 / var(--tw-bg-opacity));
}

.bg-blue-800 {
  --tw-bg-opacity: 1;
  background-color: rgb(30 64 175 / var(--tw-bg-opacity));
}

.rounded-bubble-left {
  border-top-right-radius: 1.5rem;
  border-bottom-right-radius: 1.5rem;
  border-top-left-radius: 1.5rem;
}

.rounded-bubble-right {
  border-top-left-radius: 1.5rem;
  border-bottom-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
}
</style>

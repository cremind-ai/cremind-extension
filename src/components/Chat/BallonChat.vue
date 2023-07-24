<template>
  <main class="main" :class="isLeft ? '' : 'flex-row-reverse'">
    <div style="display: flex">
      <div
        :class="
          isLeft
            ? 'rounded-bubble-left bg-gray-600'
            : 'rounded-bubble-right bg-blue-800'
        "
        class="common"
        v-html="markedRender(message)"
      ></div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { marked } from "marked";

marked.use({ silent: true, breaks: true });

defineProps({
  message: {
    type: String,
    required: true,
  },
  isLeft: {
    type: Boolean,
    default: false,
  },
});

function markedRender(text: string) {
  return marked(text);
}
</script>
<style scoped>
.main {
  width: 100%;
  margin-bottom: 1.25rem;
  display: flex;
}

.common {
  --tw-text-opacity: 1;
  color: rgb(243 244 246 / var(--tw-text-opacity));
  padding-left: 1.25rem;
  padding-right: 0.75rem;
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

<template>
  <img :src="url" :style="{ width: dynamicWidth }" class="load-img" />
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  filename: string;
  width: number;
}>();
const url = computed(() => chrome.runtime.getURL(`/img/${props.filename}`));
const dynamicWidth = computed(() => props.width + "px");
</script>

<style scoped></style>

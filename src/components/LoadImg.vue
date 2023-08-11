<template>
  <img :src="url" :width="width" class="load-img" />
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  filename: string;
  width: number;
}>();
const url = computed(() => chrome.runtime.getURL(`assets/${props.filename}`));
</script>

<style scoped>
.load-img {
  filter: none;
}
</style>

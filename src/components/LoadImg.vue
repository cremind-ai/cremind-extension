<template>
  <img :src="url" width="25" />
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  filename: string;
}>();
const url = computed(() => chrome.runtime.getURL(`assets/${props.filename}`));
</script>

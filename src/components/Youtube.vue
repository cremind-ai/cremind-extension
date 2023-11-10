<template>
  <div
    class="ytp-button"
    aria-label="Youtube Assistant"
    title="Youtube Assistant"
  >
    <div class="cremind-youtube-chat">
      <Icon
        icon="fluent:chat-12-filled"
        :style="{ fontSize: '25px', width: '50%', height: '50%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
</script>

<style scoped></style>

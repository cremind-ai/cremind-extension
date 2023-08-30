<template>
  <ElCard shadow="never">
    <template v-if="title" #header>
      <div class="content-wrap-flex content-wrap-items-center">
        <span class="content-wrap-title">{{ title }}</span>
      </div>
    </template>
    <div>
      <slot></slot>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { ElCard } from "element-plus";
import { ElTooltip } from "element-plus";

defineProps({
  title: {
    type: String,
    required: true,
    default: "",
  },
  content: {
    type: String,
    required: false,
    default: "",
  },
});
</script>
<style scoped>
.content-wrap-title {
  font-size: 16px;
  font-weight: bold;
}

.content-wrap-flex {
  display: flex;
}

.content-wrap-items-center {
  align-items: center;
}
</style>

<template>
  <div></div>
  <ElCard class="feature-card">
    <ElSwitch v-model="enable" @change="handleEnableChange(enable)" />
    {{ title }}
    {{ description }}
    <ElButton type="primary" @click="handleResetVariable()"></ElButton>
    {{ supportModes }}
  </ElCard>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref, watch } from "vue";
import { ElCard } from "element-plus";
import { ElSwitch } from "element-plus";
import { ElButton } from "element-plus";
import { selectedModeEnum } from "@/types";
const props = defineProps({
  enable: {
    type: Boolean,
    required: true,
    default: false,
  },
  id: {
    type: [String, Number],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  supportModes: {
    type: Array as PropType<selectedModeEnum[]>,
    required: true,
    default: [],
  },
});

const emits = defineEmits(["reset-variable", "enable-change"]);

watch(
  () => props.enable,
  (value) => {
    enable.value = value;
  }
);

const enable = ref(props.enable);

const handleEnableChange = (value: boolean) => {
  emits("enable-change", props.id, value);
};

const handleResetVariable = () => {
  emits("reset-variable", props.id);
};

onMounted(() => {});
</script>

<style scoped>
.feature-card {
  width: 250px;
  height: 400px;
  overflow: hidden;
}
</style>

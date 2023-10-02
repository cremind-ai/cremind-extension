<template>
  <ElCard class="prompt-feature">
    <ElCard class="prompt-feature-content-card">
      <div class="prompt-feature-icon">
        <Icon :icon="icon.content || ''" v-if="icon.type === 'icon'" />
        <div v-if="icon.type === 'svg'" v-html="icon.content" />
      </div>

      <div class="prompt-feature-title">{{ title }}</div>
      <ElPopover
        :hide-after="0"
        :title="title"
        placement="auto"
        :width="300"
        :content="description"
        trigger="click"
        :visible="false"
      >
        <template #reference>
          <div class="prompt-feature-description">{{ description }}</div>
        </template>
      </ElPopover>
    </ElCard>

    <ElButton
      class="prompt-feature-use"
      :color="LOGO_COLOR"
      :plain="isDark"
      @click="handleUse()"
      >USE
    </ElButton>
  </ElCard>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { More } from "@element-plus/icons-vue";
import { ElCard } from "element-plus";
import { ElSwitch } from "element-plus";
import { ElButton } from "element-plus";
import { ElPopover } from "element-plus";
import { ElTooltip } from "element-plus";
import { FeatureModeEnum } from "@/types";
import { LOGO_COLOR, LOGO_COLOR_DARK } from "@/constants";
import { useUserSettingsStore } from "@/store/user_settings";
import { Icon as IconType } from "@/lib/features";

const props = defineProps({
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
  icon: {
    type: Object as PropType<IconType>,
    required: true,
    default: {},
  },
});

const emits = defineEmits(["use", "enable-change"]);

const userSettings = useUserSettingsStore();

const isDark = computed(() => userSettings.getIsDark);
const visible = ref(false);

const handleUse = () => {
  emits("use", props.id);
};

const handleCloseMore = () => {
  if (visible.value) {
    visible.value = false;
  } else {
    visible.value = true;
  }
};

onMounted(() => {});
</script>

<style scoped></style>

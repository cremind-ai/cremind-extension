<template>
  <ElCard class="prompt-card-setting-feature-card">
    <ElPopover
      :hide-after="0"
      :title="title"
      placement="top"
      :width="300"
      trigger="hover"
      :content="description"
      :visible="false"
    >
      <template #reference>
        <ElCard class="prompt-card-setting-content-card">
          <ElTooltip :hide-after="0" content="Enable/Disable" placement="top">
            <ElSwitch
              class="prompt-card-setting-switch-enable"
              :style="'--el-switch-on-color: ' + switchColor"
              v-model="enable"
              @change="handleEnableChange(enable)"
            />
          </ElTooltip>
          <div class="prompt-card-setting-title">{{ title }}</div>
          <div class="prompt-card-setting-description">{{ description }}</div>
        </ElCard>
      </template>
    </ElPopover>

    <div class="prompt-card-setting-icons-container">
      <div style="font-size: 14px">SUPPORT:</div>
      <ElPopover
        :hide-after="0"
        v-for="mode in supportModes"
        :key="mode"
        placement="top"
        :width="200"
        trigger="hover"
        :content="getIconForMode(mode).info"
      >
        <template #reference>
          <Icon
            :icon="getIconForMode(mode).name"
            :style="{ fontSize: '30px', color: getIconForMode(mode).color }"
          />
        </template>
      </ElPopover>
    </div>
    <ElButton
      class="prompt-card-setting-reset-button"
      :color="LOGO_COLOR"
      :plain="isDark"
      @click="handleResetVariable()"
    >
      RESET
    </ElButton>
  </ElCard>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { ElCard } from "element-plus";
import { ElSwitch } from "element-plus";
import { ElButton } from "element-plus";
import { ElPopover } from "element-plus";
import { ElTooltip } from "element-plus";
import { FeatureModeEnum } from "@/types";
import { LOGO_COLOR, LOGO_COLOR_DARK } from "@/constants";
import { useUserSettingsStore } from "@/store/user_settings";

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
    type: Array as PropType<FeatureModeEnum[]>,
    required: true,
    default: [],
  },
});

const emits = defineEmits(["reset-variable", "enable-change"]);

const userSettings = useUserSettingsStore();

const enable = ref(props.enable);
const isDark = computed(() => userSettings.getIsDark);

const lineHeight = 14; // You might need to adjust this value based on your design

const descriptionLineCount = computed(() => {
  const descriptionElement = document.querySelector(".description");
  if (descriptionElement) {
    const descriptionHeight = descriptionElement.clientHeight;
    return Math.floor(descriptionHeight / lineHeight);
  }
  return 0;
});

const showPopoverForDescription = computed(() => {
  return descriptionLineCount.value > 6;
});

const iconColors: Record<string, string> = {
  READONLY: LOGO_COLOR,
  READONLY_DARK: LOGO_COLOR_DARK,
  EDITABLE: LOGO_COLOR,
  EDITABLE_DARK: LOGO_COLOR_DARK,
  PROMPT: LOGO_COLOR,
  PROMPT_DARK: LOGO_COLOR_DARK,
  UPLOAD: LOGO_COLOR,
  UPLOAD_DARK: LOGO_COLOR_DARK,
};

const iconsForModes = {
  READONLY: "ic:outline-no-sim",
  EDITABLE: "basil:edit-outline",
  PROMPT: "ic:outline-auto-awesome",
  UPLOAD: "ic:twotone-cloud-upload",
};

const iconsInfos = {
  READONLY: "Text selected mode and no text editing allowed.",
  EDITABLE:
    "Selected text mode and allowed to write results into the input field, e.g. like writing into an email composition box.",
  PROMPT:
    "This mode helps you select a type of prompt and implement it into an application.",
  UPLOAD:
    "This mode assists you in handling large texts or specific, unique text types and deploying them into an application.",
};
const getIconForMode = (mode: FeatureModeEnum) => {
  const iconName = iconsForModes[mode] || "";
  const iconColor = isDark.value
    ? iconColors[mode + "_DARK"] || "white"
    : iconColors[mode] || "black";
  const iconInfo = iconsInfos[mode] || "";
  return { name: iconName, color: iconColor, info: iconInfo };
};

const switchColor = computed(() => {
  return isDark.value ? LOGO_COLOR_DARK : LOGO_COLOR;
});

watch(
  () => props.enable,
  (value) => {
    enable.value = value;
  }
);

const handleEnableChange = (value: boolean) => {
  emits("enable-change", props.id, value);
};

const handleResetVariable = () => {
  emits("reset-variable", props.id);
};

onMounted(() => {});
</script>

<style scoped>
@import "@/styles/components/PromptCardSetting.scss";
</style>

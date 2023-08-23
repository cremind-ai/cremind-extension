<template>
  <ElCard class="feature-card">
    <ElPopover
      :title="title"
      placement="auto"
      :width="300"
      trigger="hover"
      :content="description"
    >
      <template #reference>
        <ElCard class="content-card">
          <ElSwitch
            class="switch-enable"
            :style="'--el-switch-on-color: ' + switchColor"
            v-model="enable"
            @change="handleEnableChange(enable)"
          />
          <div class="title">{{ title }}</div>
          <div class="description">{{ description }}</div>
        </ElCard>
      </template>
    </ElPopover>

    <div class="icons-container">
      <div style="font-size: 14px">SUPPORT:</div>
      <ElPopover
        v-for="mode in supportModes"
        :key="mode"
        placement="auto"
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
      class="reset-button"
      :color="LOGO_COLOR"
      :plain="isDark"
      @click="handleResetVariable()"
      >RESET</ElButton
    >
  </ElCard>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { ElCard } from "element-plus";
import { ElSwitch } from "element-plus";
import { ElButton } from "element-plus";
import { ElPopover } from "element-plus";
import { selectedModeEnum } from "@/types";
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
    type: Array as PropType<selectedModeEnum[]>,
    required: true,
    default: [],
  },
});

const emits = defineEmits(["reset-variable", "enable-change"]);

const userSettings = useUserSettingsStore();

const enable = ref(props.enable);
const isDark = ref(userSettings.getIsDark);

const iconColors: Record<string, string> = {
  READONLY: LOGO_COLOR,
  READONLY_DARK: LOGO_COLOR_DARK,
  EDITABLE: LOGO_COLOR,
  EDITABLE_DARK: LOGO_COLOR_DARK,
  READONLY_CONTEXT_MENU: LOGO_COLOR,
  READONLY_CONTEXT_MENU_DARK: LOGO_COLOR_DARK,
  EDITABLE_CONTEXT_MENU: LOGO_COLOR,
  EDITABLE_CONTEXT_MENU_DARK: LOGO_COLOR_DARK,
  APP: LOGO_COLOR,
  APP_DARK: LOGO_COLOR_DARK,
};

const iconsForModes = {
  READONLY: "ic:outline-no-sim",
  EDITABLE: "basil:edit-outline",
  READONLY_CONTEXT_MENU: "ic:round-no-sim",
  EDITABLE_CONTEXT_MENU: "basil:edit-solid",
  APP: "icon-park-twotone:more-app",
};

const iconsInfos = {
  READONLY: "Text selected mode and no text editing allowed.",
  EDITABLE:
    "Selected text mode and allowed to write results into the input field, e.g. like writing into an email composition box.",
  READONLY_CONTEXT_MENU:
    "Right-click to select this mode in the context menu and prevent text editing.",
  EDITABLE_CONTEXT_MENU:
    "Right-click to select this mode in the context menu and allow writing results into the input field, e.g. like writing into a post composition box on a social media page.",
  APP: "This mode is located within the feature menu on the application page.",
};
const getIconForMode = (mode: selectedModeEnum) => {
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

watch(
  () => userSettings.getIsDark,
  (value) => {
    isDark.value = value;
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
.feature-card {
  width: 250px;
  max-height: 280px;
  overflow: hidden;
  border-radius: 20px;
}

.content-card {
  height: 150px;
  overflow: hidden;
  position: relative;
  border-radius: 15px;
}

.switch-enable {
  position: absolute;
  top: 3px;
  right: 3px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--el-text-color-regular);
  word-wrap: break-word;
}

.description {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  color: var(--el-text-color-regular);
  word-wrap: break-word;
}

.icons-container {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.reset-button {
  margin-top: auto;
  width: 100%;
  border-radius: 20px;
}

:deep(.el-card__body) {
  padding: 5px;
}
</style>

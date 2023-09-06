<template>
  <ElButtonGroup>
    <ElTooltip
      :hide-after="0"
      content="Click the icon for a tidy display of the 'Options Bar'. Change mode now 👇."
      placement="top"
    >
      <ElButton
        size="small"
        class="menu-bar-button"
        style="padding: 2px"
        type="success"
        plain
      >
        <ElSwitch
          size="small"
          style="--el-switch-on-color: #13ce66"
          v-model="optionBarMode"
        />
      </ElButton>
    </ElTooltip>
    <template v-for="(feature, index) in filteredFeatureList" :key="index">
      <ElTooltip
        :hide-after="0"
        :content="feature.EDITABLE?.title"
        placement="top"
        v-if="enabledFeatureStates[convertIndexToOriginal(index)]"
      >
        <ElButton
          size="small"
          class="menu-bar-button"
          type="success"
          plain
          @click="handleFeatureClick(feature)"
        >
          <Icon
            :icon="feature.EDITABLE?.Icon.content || ''"
            :style="{ fontSize: feature.EDITABLE?.Icon.fontSize }"
            v-if="feature.EDITABLE?.Icon.type === 'icon'"
          />
          <div
            v-if="feature.EDITABLE?.Icon.type === 'svg'"
            v-html="feature.EDITABLE?.Icon.content"
          ></div>
        </ElButton>
      </ElTooltip>
    </template>
    <ElDropdown @command="handleCommand">
      <ElButton size="small" class="menu-bar-button" type="success" plain>
        <Icon icon="material-symbols:more-vert" :style="{ fontSize: '20px' }" />
      </ElButton>
      <template #dropdown>
        <ElDropdownMenu>
          <template v-for="(option, index) in moreOptions" :key="index">
            <ElDropdownItem :command="option.label">
              <ElTooltip
                :hide-after="0"
                :content="option.label"
                placement="auto"
              >
                <Icon
                  :icon="option.icon.content || ''"
                  :style="{ fontSize: option.icon.fontSize }"
                  v-if="option.icon.type === 'icon'"
                />
                <div
                  v-if="option.icon.type === 'svg'"
                  v-html="option.icon.content"
                ></div>
              </ElTooltip>
            </ElDropdownItem>
          </template>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </ElButtonGroup>
</template>

<script setup lang="ts">
import { computed, ComputedRef, PropType, ref, watch } from "vue";
import { ElButton } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElTooltip } from "element-plus";
import { ElDropdown } from "element-plus";
import { ElDropdownMenu } from "element-plus";
import { ElDropdownItem } from "element-plus";
import { ElSwitch } from "element-plus";
import { Icon } from "@iconify/vue";
import { FeatureSchema, Icon as IconType } from "@/lib/features";
import { OptionCommandType } from "@/constants/ui";

const props = defineProps({
  optionBarMode: {
    type: Boolean,
    required: true,
  },
  featureList: {
    type: Array as PropType<FeatureSchema[]>,
    required: true,
    default: [],
  },
  filteredFeatureList: {
    type: Array as PropType<FeatureSchema[]>,
    required: true,
    default: [],
  },
  enabledFeatureStates: {
    type: Array as PropType<boolean[]>,
    required: true,
    default: [],
  },
  moreOptions: {
    type: Array as PropType<
      {
        label: string;
        icon: IconType;
      }[]
    >,
    required: true,
    default: [],
  },
});

const emits = defineEmits([
  "update:optionBarMode",
  "feature-click",
  "command-click",
]);

const optionBarMode = ref(props.optionBarMode);

watch(
  () => optionBarMode.value,
  (value) => {
    emits("update:optionBarMode", value);
  }
);

function convertIndexToOriginal(indexInFiltered: number): number {
  const filteredFeature = props.filteredFeatureList[indexInFiltered];
  const idToFind = filteredFeature.id;

  for (let i = 0; i < props.featureList.length; i++) {
    if (props.featureList[i].id === idToFind) {
      return i;
    }
  }

  return -1;
}

async function handleFeatureClick(feature: FeatureSchema) {
  emits("feature-click", feature);
}

const handleCommand = (command: OptionCommandType) => {
  emits("command-click", command);
};
</script>

<style scoped></style>

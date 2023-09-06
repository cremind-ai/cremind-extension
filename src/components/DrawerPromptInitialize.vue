<template>
  <ElDrawer v-model="visible" direction="ltr" :before-close="handleCloseDrawer">
    <template #header>
      <h2>Initialize your prompt</h2>
    </template>
    <ElForm :model="formDataVariableSchema" label-position="top">
      <ElFormItem
        v-for="(schema, key) in feature.variableSchema"
        :key="key"
        :label="schema.description"
      >
        <template v-if="schema.systemOptions">
          <ElSelect
            v-model="formDataVariableSchema[key]"
            placeholder="Select"
            filterable
          >
            <ElOption
              v-for="option in SystemOptions[`${schema.systemOptions}`]"
              :key="option"
              :label="option"
              :value="option"
            ></ElOption>
          </ElSelect>
        </template>
        <template v-else-if="schema.options">
          <ElSelect
            v-model="formDataVariableSchema[key]"
            placeholder="Select"
            filterable
          >
            <ElOption
              v-for="option in schema.options"
              :key="option"
              :label="option"
              :value="option"
            ></ElOption>
          </ElSelect>
          <ElPopover
            :hide-after="0"
            placement="bottom"
            title="Add custom option"
            :width="200"
            :visible="addCustomOptionVariableSchema[key].visible"
          >
            <template #reference>
              <ElButton
                plain
                type="primary"
                :icon="Plus"
                style="margin-left: 10px"
                @click="addCustomOptionVariableSchema[key].visible = true"
              />
            </template>
            <ElInput
              v-model="addCustomOptionVariableSchema[key].input"
              placeholder=""
            />
            <div style="text-align: right; margin-top: 8px">
              <ElButton
                size="small"
                text
                @click="addCustomOptionVariableSchema[key].visible = false"
                >cancel</ElButton
              >
              <ElButton
                size="small"
                type="primary"
                @click="handleAddCustomOption(key)"
                style="margin-left: 8px"
                >confirm</ElButton
              >
            </div>
          </ElPopover>
          <ElTooltip
            :hide-after="0"
            content="Remove custom option"
            placement="top"
          >
            <ElButton
              plain
              type="danger"
              :icon="Minus"
              style="margin-left: 10px"
              @click="handleRemoveCustomOption(key)"
            />
          </ElTooltip>
        </template>
        <template v-else>
          <ElInput
            v-model="formDataVariableSchema[key]"
            autosize
            type="textarea"
            placeholder="Enter text"
          ></ElInput>
        </template>
      </ElFormItem>
      <br />
      <ElFormItem>
        <ElButton @click="handleAutoFillSample">Auto Fill Sample</ElButton>
        <ElButton @click="handleRun">Run</ElButton>
      </ElFormItem>
    </ElForm>
  </ElDrawer>
</template>

<script setup lang="ts">
import { computed, PropType, ref, watch } from "vue";
import { ElPopover } from "element-plus";
import { ElButton } from "element-plus";
import { ElDrawer } from "element-plus";
import { ElInput } from "element-plus";
import { ElSelect } from "element-plus";
import { ElOption } from "element-plus";
import { ElForm } from "element-plus";
import { ElFormItem } from "element-plus";
import { ElDivider } from "element-plus";
import { ElMessage } from "element-plus";
import { ElTooltip } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { Minus } from "@element-plus/icons-vue";
import { concat, findIndex, includes, pull } from "lodash-es";
import { FeatureType } from "@/lib/features";
import { SystemOptions } from "@/constants/system_variables";
import { featureModeEnum } from "@/types";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { getJsonFeatures } from "@/lib/common";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  feature: {
    type: Object as PropType<FeatureType>,
    required: true,
    default: {},
  },
  featureId: {
    type: String,
    required: true,
    default: "",
  },
  featureMode: {
    type: String as PropType<featureModeEnum>,
    required: true,
    validator: (value: string) =>
      Object.values(featureModeEnum).includes(value as featureModeEnum),
  },
  formData: {
    type: Object as PropType<{ [key: string]: string }>,
    required: true,
    default: {},
  },
});

const emits = defineEmits([
  "update:visible",
  "update:feature",
  "auto-fill",
  "run",
  "close",
]);

const visible = ref(props.visible);
const formDataVariableSchema = ref<{ [key: string]: string }>(props.formData);
const addCustomOptionVariableSchema = ref<{
  [key: string]: { input: string; visible: boolean };
}>({});

watch(
  () => props.visible,
  (value) => {
    visible.value = value;
  }
);

watch(
  () => visible.value,
  (value) => {
    emits("update:visible", value);
  }
);

watch(
  () => props.formData,
  (value) => {
    formDataVariableSchema.value = value;
  }
);

watch(
  () => props.feature,
  (value) => {
    for (const key in props.feature.variableSchema) {
      addCustomOptionVariableSchema.value[key] = {
        visible: false,
        input: "",
      };
    }
  }
);

const handleAddCustomOption = async (key: string | number) => {
  const storageKey = `FEATURE:${props.featureId}:${props.featureMode}:custom_options:${key}`;
  const value = await ChromeStorage.getInstance().get(storageKey);
  let arrList: string[] = [];
  if (value) {
    arrList = JSON.parse(value);
  }
  arrList.push(addCustomOptionVariableSchema.value[key].input);
  await ChromeStorage.getInstance().set(storageKey, JSON.stringify(arrList));
  const featureList = await getJsonFeatures();
  const featureIndex = findIndex(featureList, {
    id: props.featureId,
  });
  const currentFeature = featureList[featureIndex][props.featureMode];
  emits("update:feature", currentFeature);
  formDataVariableSchema.value[key] =
    addCustomOptionVariableSchema.value[key].input;
  addCustomOptionVariableSchema.value[key].visible = false;
};

const handleRemoveCustomOption = async (key: string | number) => {
  const storageKey = `FEATURE:${props.featureId}:${props.featureMode}:custom_options:${key}`;
  const value = await ChromeStorage.getInstance().get(storageKey);
  let arrList: string[] = [];
  if (value) {
    arrList = JSON.parse(value);
  }
  if (
    formDataVariableSchema.value[key] &&
    includes(arrList, formDataVariableSchema.value[key])
  ) {
    pull(arrList, formDataVariableSchema.value[key]);
    await ChromeStorage.getInstance().set(storageKey, JSON.stringify(arrList));
    const featureList = await getJsonFeatures();
    const featureIndex = findIndex(featureList, {
      id: props.featureId,
    });
    const currentFeature = featureList[featureIndex][props.featureMode]!;
    // Fill default value
    if (currentFeature.variableSchema[key].options) {
      formDataVariableSchema.value[key] = currentFeature.variableSchema[key]
        .options![
        currentFeature.variableSchema[key].default as number
      ] as string;
    }
    emits("update:feature", currentFeature);
  } else if (
    formDataVariableSchema.value[key] &&
    !includes(arrList, formDataVariableSchema.value[key])
  ) {
    ElMessage.error("System option cannot be deleted");
  }
};

const handleAutoFillSample = () => {
  for (const key in props.feature.variableSchema) {
    if (props.feature.variableSchema[key].options) {
      formDataVariableSchema.value[key] = props.feature.variableSchema[key]
        .options![props.feature.variableSchema[key].sample as number] as string;
    } else {
      formDataVariableSchema.value[key] = props.feature.variableSchema[key]
        .sample as string;
    }
  }
};

const handleRun = () => {
  console.log("handleRun");
  visible.value = false;
  for (const key in props.feature.variableSchema) {
    if (!formDataVariableSchema.value[key]) {
      if (props.feature.variableSchema[key].options) {
        formDataVariableSchema.value[key] = props.feature.variableSchema[key]
          .options![
          props.feature.variableSchema[key].default as number
        ] as string;
      } else {
        formDataVariableSchema.value[key] = props.feature.variableSchema[key]
          .default as string;
      }
    }
  }
  emits("run", formDataVariableSchema.value);
};

const handleCloseDrawer = () => {
  for (const key in addCustomOptionVariableSchema.value) {
    addCustomOptionVariableSchema.value[key].visible = false;
  }
  visible.value = false;
  emits("close");
};
</script>

<style scoped></style>

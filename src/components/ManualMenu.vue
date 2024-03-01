<template>
  <ElButton
    class="manual-menu-close-icon"
    type="danger"
    plain
    :icon="Close"
    @click="handleClose"
    size="small"
    circle
  ></ElButton>
  <ElInput
    v-model="insertedText"
    placeholder="Please insert text here"
    :autosize="{ minRows: 3, maxRows: 9 }"
    type="textarea"
    @keydown="handleKey"
    @keyup="handleKey"
    @keypress="handleKey"
  />
  <MenuBar
    style="margin-top: 10px"
    :only-menu="true"
    :feature-list="featureList"
    :filtered-feature-list="filteredFeatureList"
    @feature-click="handleFeatureClick"
  />
  <QuickFeatureCard
    :show="showOuput"
    v-model:start="isStarted"
    v-model:is-streaming="isStreaming"
    v-model:drawer="drawer"
    :header-alignment-left="true"
    :feature-mode="FeatureModeEnum.READONLY"
    :feature-schema="featureSchema"
    @close="handleClose"
    @data="quickFeatureDataEvent"
    @complete="quickFeatureCompleteEvent"
    @error="quickFeatureErrorEvent"
    @new-chat="handleNewChat"
  >
  </QuickFeatureCard>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from "vue";
import { Close } from "@element-plus/icons-vue";
import { ElInput } from "element-plus";
import { ElCard } from "element-plus";
import { ElMessageBox } from "element-plus";
import { MenuBar } from "@/components";
import { FeatureSchema } from "@/lib/features";
import { AIMode, MAXIMUM_FEATURES_SIZE_DEFAULT } from "@/constants";
import { useUserSettingsStore } from "@/store/user_settings";
import { getJsonFeatures } from "@/lib/common";
import { FeatureModeEnum } from "@/types";
import { QuickFeatureCard } from "@/components";
import { SystemVariableParser } from "@/lib";

const userSettings = useUserSettingsStore();

const props = defineProps({
  isStreaming: {
    type: Boolean,
    required: false,
    default: false,
  },
  drawerShow: {
    type: Boolean,
    required: false,
    default: false,
  },
  showOuput: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits([
  "update:isStreaming",
  "update:drawerShow",
  "featureClick",
  "newChat",
  "close",
  "data",
  "complete",
  "error",
]);

const aiProviderKey = computed(() => {
  if (userSettings.getAiProvider === AIMode.CHAT_GPT) {
    return "ChatGPT";
  } else if (userSettings.getAiProvider === AIMode.GEMINI) {
    return "Gemini";
  } else if (userSettings.getAiProvider === AIMode.CLAUDE) {
    return "Claude";
  }
  return "ChatGPT";
});

const insertedText = ref("");
const isStreaming = ref(props.isStreaming);
const isStarted = ref(false);
const drawer = ref(false);
const featureSchema: Ref<FeatureSchema> = ref({} as FeatureSchema);
const featureList: Ref<FeatureSchema[]> = ref([]);
const filteredFeatureList = computed(() => {
  const _filteredFeatureList = featureList.value.filter((feature) => {
    const { READONLY } = feature;
    return READONLY !== undefined && READONLY![aiProviderKey.value] !== null;
  });
  return _filteredFeatureList;
});
let dataResponse: string = "";

watch(
  () => props.isStreaming,
  (value) => {
    isStreaming.value = value;
  }
);

watch(
  () => isStreaming.value,
  (value) => {
    emits("update:isStreaming", value);
  }
);

watch(
  () => props.drawerShow,
  (value) => {
    if (!value) {
      isStarted.value = false;
    }
    drawer.value = value;
  }
);

watch(
  () => drawer.value,
  (value) => {
    emits("update:drawerShow", value);
  }
);

function quickFeatureDataEvent(data: string) {
  emits("data", data);
}

function quickFeatureCompleteEvent(data: string) {
  dataResponse = data;
  isStarted.value = false;
  emits("complete", data);
}

function quickFeatureErrorEvent() {
  dataResponse = "";
  isStarted.value = false;
  emits("error");
}

function handleFeatureClick(_featureSchema: FeatureSchema) {
  dataResponse = "";
  if (isStreaming.value) {
    ElMessageBox.alert(
      "You cannot switch feature because the response is being streamed",
      "Warning",
      {
        confirmButtonText: "OK",
        callback: () => {},
      }
    );
    return;
  }
  if (insertedText.value !== "") {
    SystemVariableParser.getInstance().setSelectedText(insertedText.value);
    featureSchema.value = _featureSchema;
    isStarted.value = true;
    emits("featureClick", insertedText.value);
  }
}

const handleClose = () => {
  isStarted.value = false;
  emits("close");
};

const handleNewChat = (value: string) => {
  let text = "";
  text += SystemVariableParser.getInstance().getSelectedText() + "\n";
  text += "\\=\\=\\=\n";
  text += dataResponse + "\n";
  text += "\\=\\=\\=\n";
  text += value + "\n";
  emits("newChat", text);
};

const handleKey = (event: Event | KeyboardEvent) => {
  event.stopPropagation();
};

onMounted(async () => {
  const resFeatures = await getJsonFeatures(
    true,
    1,
    MAXIMUM_FEATURES_SIZE_DEFAULT,
    null,
    null
  );
  featureList.value = resFeatures.list;
});
</script>

<style scoped></style>

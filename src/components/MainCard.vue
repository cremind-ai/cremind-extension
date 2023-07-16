<template>
  <ElPopover
    style="word-break: normal"
    placement="bottom"
    :visible="visible"
    :width="width"
    popper-style="background-image: linear-gradient(140deg, rgba(234, 222, 219, 0.4) 0%, rgba(188, 112, 164, 0.4) 50%, rgba(191, 214, 65, 0.4) 75%);"
  >
    <template #reference>
      <div
        class="option-bar"
        :style="{ top, left }"
        v-show="show"
        @click="visible = true"
      >
        <LoadImg class="cword-icon" :filename="'check64.png'" />
        <div v-if="selectedMode === selectedModeEnum.EDITABLE">
          <ElButtonGroup>
            <template
              v-for="(feature, index) in filteredFeatureList"
              :key="index"
            >
              <ElButton
                type="success"
                plain
                @click="handleFeatureClick(index, selectedModeEnum.EDITABLE)"
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
            </template>
          </ElButtonGroup>
        </div>
        <div v-else-if="selectedMode === selectedModeEnum.READONLY">
          <ElButtonGroup>
            <template
              v-for="(feature, index) in filteredFeatureList"
              :key="index"
            >
              <ElButton
                type="success"
                plain
                @click="handleFeatureClick(index, selectedModeEnum.READONLY)"
              >
                <Icon
                  :icon="feature.READONLY?.Icon.content || ''"
                  :style="{ fontSize: feature.READONLY?.Icon.fontSize }"
                  v-if="feature.READONLY?.Icon.type === 'icon'"
                />
                <span
                  v-if="feature.READONLY?.Icon.type === 'svg'"
                  v-html="feature.READONLY?.Icon.content"
                  :style="{
                    fontSize: feature.READONLY?.Icon.fontSize,
                    width: feature.READONLY?.Icon.width,
                    height: feature.READONLY?.Icon.height,
                  }"
                ></span>
              </ElButton>
            </template>
          </ElButtonGroup>
        </div>
        <div v-else-if="selectedMode === selectedModeEnum.EDITABLE_NO_CONTENT">
          <ElButtonGroup>
            <template
              v-for="(feature, index) in filteredFeatureList"
              :key="index"
            >
              <ElButton
                type="success"
                plain
                @click="
                  handleFeatureClick(
                    index,
                    selectedModeEnum.EDITABLE_NO_CONTENT
                  )
                "
              >
                <Icon
                  :icon="feature.EDITABLE_NO_CONTENT?.Icon.content || ''"
                  :style="{
                    fontSize: feature.EDITABLE_NO_CONTENT?.Icon.fontSize,
                  }"
                  v-if="feature.EDITABLE_NO_CONTENT?.Icon.type === 'icon'"
                />
                <span
                  v-if="feature.EDITABLE_NO_CONTENT?.Icon.type === 'svg'"
                  v-html="feature.EDITABLE_NO_CONTENT?.Icon.content"
                  :style="{
                    fontSize: feature.EDITABLE_NO_CONTENT?.Icon.fontSize,
                    width: feature.EDITABLE_NO_CONTENT?.Icon.width,
                    height: feature.EDITABLE_NO_CONTENT?.Icon.height,
                  }"
                ></span>
              </ElButton>
            </template>
          </ElButtonGroup>
        </div>
      </div>
    </template>
    <ElDrawer
      v-model="drawer"
      title="Initialize your prompt"
      direction="ltr"
      :before-close="handleCloseDrawer"
    >
      <ElForm :model="formDataVariableSchema" label-position="top">
        <ElFormItem
          v-for="(schema, key) in currentFeature.variableSchema"
          :key="key"
          :label="schema.description"
        >
          <template v-if="schema.options">
            <ElSelect
              v-model="formDataVariableSchema[key]"
              placeholder="Select"
            >
              <ElOption
                v-for="option in schema.options"
                :key="option"
                :label="option"
                :value="option"
              ></ElOption>
            </ElSelect>
          </template>
          <template v-else>
            <ElInput
              v-model="formDataVariableSchema[key]"
              placeholder="Enter text"
            ></ElInput>
          </template>
        </ElFormItem>
        <br />
        <ElFormItem>
          <ElButton @click="handleStartConversation">Run</ElButton>
        </ElFormItem>
      </ElForm>
    </ElDrawer>
    <ElScrollbar ref="scrollContentRef" :maxHeight="contentMaxHeight">
      <div
        style="margin-top: 25px; padding: 20px"
        ref="contentRef"
        v-html="markedRender(outputContent)"
      ></div>
    </ElScrollbar>

    <ElButton
      class="card-close-icon"
      type="danger"
      plain
      :icon="Close"
      @click="handleClose"
      size="small"
      circle
    ></ElButton>
  </ElPopover>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, Ref, computed } from "vue";
import { ElPopover } from "element-plus";
import { ElButton } from "element-plus";
import { ElButtonGroup } from "element-plus";
import { ElScrollbar } from "element-plus";
import { ElMessageBox } from "element-plus";
import { ElDrawer } from "element-plus";
import { ElInput } from "element-plus";
import { ElSelect } from "element-plus";
import { ElOption } from "element-plus";
import { ElForm } from "element-plus";
import { ElFormItem } from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { Icon } from "@iconify/vue";
import { marked } from "marked";
import { LoadImg } from ".";
import { featureList } from "../lib/features/template";
import { selectedModeEnum } from "../types";
import { FeatureType } from "../lib/features";
import { ChainBuilder } from "../lib/chain/chain_builder";
import { ChainVariableSchema } from "../lib/chain";
import { CWException } from "../types/exception";
import { ChromeStorage } from "../hooks/chrome_storage";

const props = defineProps({
  selectedText: {
    type: String,
    required: true,
  },
  top: {
    type: String,
    required: true,
  },
  left: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
  selectedMode: {
    type: String,
    required: true,
    validator: (value: string) =>
      Object.values(selectedModeEnum).includes(value as selectedModeEnum),
  },
});

marked.use({ silent: true, breaks: true, pedantic: true });

const emits = defineEmits(["close"]);

const show = ref(props.show);
const visible = ref(false);
const optionBarRef: Ref<HTMLDivElement> = ref(null as any);
const popoverRef: Ref<HTMLDivElement> = ref(null as any);
const contentRef: Ref<HTMLDivElement> = ref(null as any);
const originalActiveElement: Ref<any> = ref(null as any);
const width = ref(0);
const selectedMode: Ref<selectedModeEnum> = ref(
  props.selectedMode as selectedModeEnum
);
const clickedFeatureIndex = ref(-1);
const clickedFeatureType = ref("");
const outputContent = ref("");
const scrollContentRef = ref<InstanceType<typeof ElScrollbar>>();
const contentMaxHeight = ref(500);
const clickOutsideConfirm = ref(false);
const clickOutsideFocus = ref(true);
const isStreaming = ref(false);
const currentFeature: Ref<FeatureType> = ref({} as FeatureType);
const currentFeatureId: Ref<string> = ref("");
const currentFeatureMode: Ref<selectedModeEnum> = ref(
  selectedModeEnum.EDITABLE_NO_CONTENT
);
const filteredFeatureList = computed(() => {
  return featureList.filter((feature) => {
    const { READONLY, EDITABLE, EDITABLE_NO_CONTENT } = feature;

    switch (selectedMode.value) {
      case selectedModeEnum.READONLY:
        return READONLY !== undefined;
      case selectedModeEnum.EDITABLE:
        return EDITABLE !== undefined;
      case selectedModeEnum.EDITABLE_NO_CONTENT:
        return EDITABLE_NO_CONTENT !== undefined;
      default:
        return false;
    }
  });
});
const drawer = ref(false);
const formDataVariableSchema = ref<{ [key: string]: string }>({});

let startSelectionIndex: number = 0;
let endSelectionIndex: number = 0;

watch(
  () => props.show,
  (newValue) => {
    show.value = newValue;
    if (newValue === true) {
      const activeElement = document.activeElement as HTMLElement;
      if (
        selectedMode.value === selectedModeEnum.EDITABLE_NO_CONTENT ||
        selectedMode.value === selectedModeEnum.EDITABLE
      ) {
        originalActiveElement.value = activeElement as HTMLInputElement;
      }

      if (
        originalActiveElement.value &&
        originalActiveElement.value!.value !== undefined &&
        originalActiveElement.value!.value !== null
      ) {
        startSelectionIndex = originalActiveElement.value!.selectionStart;
        endSelectionIndex = originalActiveElement.value!.selectionEnd;
      } else if (
        originalActiveElement.value &&
        ((originalActiveElement.value!.innerText !== undefined &&
          originalActiveElement.value!.innerText !== null) ||
          (originalActiveElement.value!.textContent !== undefined &&
            originalActiveElement.value!.textContent !== null))
      ) {
        var selection = window.getSelection();
        let selectedText = selection!.toString();
        var range = selection!.getRangeAt(0).cloneRange();
        range.selectNodeContents(activeElement);
        range.setEnd(
          selection!.getRangeAt(0).startContainer,
          selection!.getRangeAt(0).startOffset
        );
        startSelectionIndex = range.toString().length;
        endSelectionIndex = startSelectionIndex + selectedText.length;
      }
    }
  }
);

watch(
  () => props.selectedText,
  (newValue) => {
    width.value = 0;
  }
);

watch(
  () => outputContent.value,
  (newValue) => {
    const _width = contentRef.value.offsetWidth;
    if (_width > 800) {
      width.value = 800;
    }
  }
);

watch(
  () => props.selectedMode,
  (newValue) => {
    selectedMode.value = newValue as selectedModeEnum;
  }
);

function markedRender(text: string) {
  return marked.parse(text);
}

const scrollToBottom = () => {
  scrollContentRef.value!.setScrollTop(contentRef.value!.clientHeight);
};

const writeOriginalActiveElementValue = (text: string) => {
  if (
    originalActiveElement.value!.value !== undefined &&
    originalActiveElement.value!.value !== null
  ) {
    originalActiveElement.value!.value = text;
  } else if (
    originalActiveElement.value!.innerText !== undefined &&
    originalActiveElement.value!.innerText !== null
  ) {
    originalActiveElement.value!.innerText = text;
  } else if (
    originalActiveElement.value!.textContent !== undefined &&
    originalActiveElement.value!.textContent !== null
  ) {
    originalActiveElement.value!.textContent = text;
  }
};

const readOriginalActiveElementValue = (): string => {
  if (
    originalActiveElement.value!.value !== undefined &&
    originalActiveElement.value!.value !== null
  ) {
    return originalActiveElement.value!.value;
  } else if (
    originalActiveElement.value!.innerText !== undefined &&
    originalActiveElement.value!.innerText !== null
  ) {
    return originalActiveElement.value!.innerText;
  } else if (
    originalActiveElement.value!.textContent !== undefined &&
    originalActiveElement.value!.textContent !== null
  ) {
    return originalActiveElement.value!.textContent;
  }
  return "";
};

const startConversation = async (variables: { [key: string]: string }) => {
  const chainBuilder = new ChainBuilder(currentFeature.value.Chains);
  console.log(variables);
  for (const key in variables) {
    const storageKey = `FEATURE:${currentFeatureId.value}:${currentFeatureMode.value}:${key}`;
    console.log(storageKey);
    await ChromeStorage.getInstance().set(storageKey, variables[key]);
  }
  await chainBuilder.buildChains(variables);
  const result = await chainBuilder.executeChains();

  let startPart: string;
  let endPart: string;
  if (
    (currentFeatureMode.value === selectedModeEnum.EDITABLE_NO_CONTENT ||
      currentFeatureMode.value === selectedModeEnum.EDITABLE) &&
    currentFeature.value.WriteResponse &&
    currentFeature.value.WriteResponse === true
  ) {
    // Remove selected text
    let text = readOriginalActiveElementValue();
    startPart = text.slice(0, startSelectionIndex);
    endPart = text.slice(endSelectionIndex);
  }

  let responses = "";
  result.on("data", (data: string) => {
    outputContent.value += data;
    console.log(data);
    if (
      (currentFeatureMode.value === selectedModeEnum.EDITABLE_NO_CONTENT ||
        currentFeatureMode.value === selectedModeEnum.EDITABLE) &&
      currentFeature.value.WriteResponse &&
      currentFeature.value.WriteResponse === true
    ) {
      responses += data;
      writeOriginalActiveElementValue(startPart + responses + endPart);
    }
    scrollToBottom();
  });
  result.on("complete", (data: string) => {
    console.log("=====>complete");
    outputContent.value += "<br>";
    console.log(data);
  });
  result.on("endOfChain", (data: string) => {
    console.log("=====>endOfChain");
    isStreaming.value = false;
    console.log(data);
  });
  result.on("error", (error: CWException) => {
    isStreaming.value = false;
    console.log(error);
  });
};

async function handleFeature(
  id: string,
  feature: FeatureType,
  type: selectedModeEnum
) {
  const variables: { [key: string]: string } = {};
  let checkShowDrawer: boolean = false;
  isStreaming.value = true;
  currentFeature.value = feature;
  currentFeatureId.value = id;
  currentFeatureMode.value = type;
  console.log(id);
  console.log(feature.variableSchema);

  for (const key in feature.variableSchema) {
    if (!feature.variableSchema[key].storage) {
      checkShowDrawer = true;
      continue;
    }
    const storageKey = `FEATURE:${id}:${type}:${key}`;
    console.log(storageKey);
    const value = await ChromeStorage.getInstance().get(storageKey);
    console.log(value);
    if (!value) {
      checkShowDrawer = true;
      continue;
    }
    variables[key] = value;
    formDataVariableSchema.value[key] = value;
  }
  console.log("checkShowDrawer", checkShowDrawer);
  drawer.value = checkShowDrawer;

  if (!checkShowDrawer) {
    startConversation(variables);
  } else {
    clickOutsideFocus.value = false;
  }
}

function handleFeatureClick(index: number, type: selectedModeEnum) {
  outputContent.value = "";
  const filteredIndex = featureList.findIndex((feature) => {
    return (
      (type === selectedModeEnum.EDITABLE_NO_CONTENT &&
        feature.EDITABLE_NO_CONTENT !== undefined) ||
      (type === selectedModeEnum.EDITABLE && feature.EDITABLE !== undefined) ||
      (type === selectedModeEnum.READONLY && feature.READONLY !== undefined)
    );
  });

  if (filteredIndex !== -1) {
    clickedFeatureIndex.value = filteredIndex;
    clickedFeatureType.value = type;
    console.log("handleFeatureClick", filteredIndex, type);
    const feature: FeatureType = featureList[filteredIndex][type]!;
    const id = featureList[filteredIndex].id;
    handleFeature(id, feature, type);
  }
}

function close() {
  console.log("Close");
  visible.value = false;
  setTimeout(() => {
    show.value = false;
    emits("close");
  }, 0);
}

function handleClose() {
  if (isStreaming.value) {
    clickOutsideConfirm.value = true;
    ElMessageBox.confirm(
      "The result is being streamed, do you want to exit?",
      "Warning",
      {
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    )
      .then(() => {
        close();
        clickOutsideConfirm.value = false;
      })
      .catch(() => {
        clickOutsideConfirm.value = false;
      });
  } else {
    close();
  }
}

const handleClickOutside = (event: MouseEvent) => {
  console.log("handleClickOutside");
  if (
    clickOutsideFocus.value &&
    !clickOutsideConfirm.value &&
    optionBarRef.value &&
    !optionBarRef.value.contains(event.target as Node) &&
    popoverRef.value &&
    !popoverRef.value.contains(event.target as Node) &&
    show.value
  ) {
    if (isStreaming.value) {
      clickOutsideConfirm.value = true;
      ElMessageBox.confirm(
        "The result is being streamed, do you want to exit?",
        "Warning",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(() => {
          close();
          clickOutsideConfirm.value = false;
        })
        .catch(() => {
          clickOutsideConfirm.value = false;
        });
    } else {
      close();
    }
  }
};

const handleStartConversation = () => {
  clickOutsideFocus.value = true;
  drawer.value = false;
  startConversation(formDataVariableSchema.value);
};

const handleCloseDrawer = () => {
  clickOutsideFocus.value = true;
  drawer.value = false;
  isStreaming.value = false;
  close();
};

onMounted(async () => {
  console.log("onMounted");
  optionBarRef.value = document.querySelector(".option-bar") as HTMLDivElement;
  popoverRef.value = document.querySelector(".el-popover") as HTMLDivElement;
  document.addEventListener("mousedown", handleClickOutside);
  // await ChromeStorage.getInstance().removeWithWildcard("FEATURE:");
});

onUnmounted(() => {
  console.log("onUnmounted");
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<style scoped>
.option-bar {
  position: fixed;
  z-index: 99999;
}

.card-close-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

.cword-icon {
  position: absolute;
  top: -22px;
  left: -20px;
}
</style>

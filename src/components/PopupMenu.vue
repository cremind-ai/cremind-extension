<template>
  <div v-if="iconMaximizeShow" class="popup-card-maximize">
    <ElTooltip
      :hide-after="0"
      content="Go back to the CreMind Extension dialog"
      placement="top"
    >
      <ElButton
        type="success"
        plain
        :icon="FullScreen"
        @click="handleGoback"
        circle
      ></ElButton>
    </ElTooltip>
  </div>

  <div v-if="isSidebar === SidebarMode.SIDEBAR">
    <div
      class="popup-card-cremind-icon-bar"
      :style="{
        zIndex: '2147483647',
        top: optionBarTop,
        left: optionBarLeft,
      }"
    >
      <LoadImg
        class="popup-card-cremind-logo"
        :filename="'CreMind-logo-white-64.png'"
        :width="20"
        v-show="logoShow"
        @click="handleClickLogo"
      ></LoadImg>
      <div
        class="popup-card-option-bar"
        v-show="optionBarShow"
        :style="{
          marginTop: optionBarMarginTop,
          marginLeft: optionBarMarginLeft,
        }"
      >
        <MenuBar
          v-model:option-bar-mode="tidyDisplayOptionBarMode"
          :feature-list="featureList"
          :filtered-feature-list="filteredFeatureList"
          :more-options="moreOptions"
          @feature-click="handleFeatureClick"
          @command-click="handleCommand"
        />
      </div>
      <QuickFeatureCard
        :show="false"
        v-model:start="isStarted"
        v-model:is-streaming="isStreaming"
        v-model:drawer="drawer"
        :feature-mode="featureMode"
        :feature-schema="featureSchema"
        :header-alignment-left="false"
        @close="close"
        @data="quickFeatureDataEvent"
        @complete="quickFeatureCompleteEvent"
        @error="quickFeatureErrorEvent"
      >
      </QuickFeatureCard>
    </div>
  </div>
  <div v-else-if="isSidebar === SidebarMode.WINDOWS">
    <ElPopover
      :hide-after="0"
      class="popup-card-popover"
      style="word-break: normal"
      placement="bottom"
      :visible="popoverVisible"
      :width="width"
      popper-style="background-image: linear-gradient(140deg, rgba(234, 222, 219, 0.4) 0%, rgba(255, 78, 199, 0.4) 50%, rgba(191, 214, 65, 0.4) 75%); border-radius: 14px;"
    >
      <template #reference>
        <div
          class="popup-card-cremind-icon-bar"
          :style="{
            zIndex: '2147483647',
            top: optionBarTop,
            left: optionBarLeft,
          }"
        >
          <LoadImg
            class="popup-card-cremind-logo"
            :filename="'CreMind-logo-white-64.png'"
            :width="20"
            v-show="logoShow"
            @click="handleClickLogo"
          ></LoadImg>
          <div
            class="popup-card-option-bar"
            v-show="optionBarShow"
            :style="{
              marginTop: optionBarMarginTop,
              marginLeft: optionBarMarginLeft,
            }"
          >
            <MenuBar
              v-model:option-bar-mode="tidyDisplayOptionBarMode"
              :feature-list="featureList"
              :filtered-feature-list="filteredFeatureList"
              :more-options="moreOptions"
              @feature-click="handleFeatureClick"
              @command-click="handleCommand"
            />
          </div>
        </div>
      </template>

      <ElButton
        class="popup-card-minimize-icon"
        type="warning"
        plain
        :icon="SemiSelect"
        @click="handleMinimize"
        size="small"
        circle
      ></ElButton>
      <ElButton
        class="popup-card-close-icon"
        type="danger"
        plain
        :icon="Close"
        @click="handleClose"
        size="small"
        circle
      ></ElButton>
      <div ref="quickFeatureCardRef">
        <QuickFeatureCard
          :show="true"
          v-model:start="isStarted"
          v-model:is-streaming="isStreaming"
          v-model:drawer="drawer"
          :feature-mode="featureMode"
          :feature-schema="featureSchema"
          :header-alignment-left="true"
          @close="close"
          @new-chat="newChatEvent"
          @data="quickFeatureDataEvent"
          @complete="quickFeatureCompleteEvent"
          @error="quickFeatureErrorEvent"
        >
        </QuickFeatureCard>
      </div>
    </ElPopover>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  Ref,
  computed,
  nextTick,
  PropType,
  ComputedRef,
} from "vue";
import { ElPopover } from "element-plus";
import { ElButton } from "element-plus";
import { ElMessageBox } from "element-plus";
import { ElTooltip } from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { SemiSelect } from "@element-plus/icons-vue";
import { FullScreen } from "@element-plus/icons-vue";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { LoadImg } from ".";
import {
  CommunicationMessageTypeEnum,
  IPCTopicEnum,
  IPCMessageType,
  FeatureModeEnum,
} from "@/types";
import { FeatureSchema } from "@/lib/features";
import { moreOptions, OptionCommandType } from "@/constants/ui";
import { QuickFeatureCard } from "@/components";
import { MenuBar } from "@/components";
import { consoleLog, LogLevelEnum } from "@/utils";
import { useUserSettingsStore } from "@/store/user_settings";
import { AIMode, MAXIMUM_FEATURES_SIZE_DEFAULT } from "@/constants";
import { getJsonFeatures } from "@/lib/common";
import { SidebarMode } from "@/types/ui";

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  isStreaming: {
    type: Boolean,
    required: false,
    default: false,
  },
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
  drawerShow: {
    type: Boolean,
    required: false,
    default: false,
  },
  sidebar: {
    type: String as PropType<SidebarMode>,
    required: true,
    default: SidebarMode.NONE,
  },
  featureMode: {
    type: String as PropType<FeatureModeEnum>,
    required: true,
    validator: (value: string) =>
      Object.values(FeatureModeEnum).includes(value as FeatureModeEnum),
  },
  activeElement: {
    type: Object as PropType<HTMLElement | HTMLInputElement>,
    required: true,
    default: {},
  },
});

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);
marked.use({ silent: true, breaks: true });

const emits = defineEmits([
  "update:isStreaming",
  "update:drawerShow",
  "unmounted",
  "close",
  "newChat",
  "data",
  "complete",
  "error",
  "featureClick",
]);

const userSettings = useUserSettingsStore();

const aiProviderKey = computed(() => {
  if (userSettings.getAiProvider === AIMode.CHAT_GPT) {
    return "ChatGPT";
  } else if (userSettings.getAiProvider === AIMode.BARD) {
    return "Bard";
  } else if (userSettings.getAiProvider === AIMode.CLAUDE) {
    return "Claude";
  }
  return "ChatGPT";
});

const isSidebar = ref(props.sidebar);
const optionBarShow = ref(false);
const tidyDisplayOptionBarMode = ref(userSettings.getTidyDisplayOptionBarMode);
const popoverVisible = ref(false);
const optionBarTop = ref(props.top);
const optionBarLeft = ref(props.left);
const optionBarRef: Ref<HTMLDivElement> = ref(null as any);
const optionBarMarginTop = ref("-6px");
const optionBarMarginLeft = ref("16px");
const logoRef: Ref<HTMLDivElement> = ref(null as any);
const popoverRef: Ref<HTMLDivElement> = ref(null as any);
const quickFeatureCardRef: Ref<HTMLDivElement> = ref(null as any);
const width = ref(0);
const featureMode: Ref<FeatureModeEnum> = ref(
  props.featureMode as FeatureModeEnum
);
const originalActiveElement: Ref<any> = ref(null as any);
const outputContent = ref("");
const clickOutsideConfirm = ref(false);
const isStreaming = ref(props.isStreaming);
const isStarted = ref(false);
const iconMaximizeShow = ref(false);
const logoShow = ref(false);
const drawer = ref(false);

const featureSchema: Ref<FeatureSchema> = ref({} as FeatureSchema);
const featureList: Ref<FeatureSchema[]> = ref([]);
const filteredFeatureList = computed(() => {
  const _filteredFeatureList = featureList.value.filter((feature) => {
    const { READONLY, EDITABLE } = feature;
    switch (featureMode.value) {
      case FeatureModeEnum.READONLY:
        return (
          READONLY !== undefined && READONLY![aiProviderKey.value] !== null
        );
      case FeatureModeEnum.EDITABLE:
        return (
          EDITABLE !== undefined && EDITABLE![aiProviderKey.value] !== null
        );
      default:
        return false;
    }
  });
  return _filteredFeatureList;
});

let startPart: string | null = null;
let endPart: string | null = null;

let shadowClickInside = false;

watch(
  () => props.selectedText,
  (newValue) => {
    width.value = 0;
  }
);

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

watch(
  () => props.featureMode,
  (newValue) => {
    featureMode.value = newValue as FeatureModeEnum;
  }
);

watch(
  () => userSettings.getTidyDisplayOptionBarMode,
  (value) => {
    tidyDisplayOptionBarMode.value = value;
  }
);

watch(
  () => tidyDisplayOptionBarMode.value,
  (value) => {
    userSettings.setTidyDisplayOptionBarMode(value);
  }
);

const writeOriginalActiveElementValue = (text: string) => {
  // TODO
  return;
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

function newChatEvent(value: string) {
  emits("newChat", value);
}

function quickFeatureDataEvent(data: string) {
  outputContent.value += data;
  if (
    featureMode.value === FeatureModeEnum.EDITABLE &&
    featureSchema.value[featureMode.value]![aiProviderKey.value]!
      .WriteResponse &&
    featureSchema.value[featureMode.value]![aiProviderKey.value]!
      .WriteResponse === true
  ) {
    writeOriginalActiveElementValue(startPart + outputContent.value + endPart);
  }

  if (
    quickFeatureCardRef.value &&
    quickFeatureCardRef.value.clientWidth > 700
  ) {
    width.value = 700;
  }
  emits("data", data, props.index);
}

function quickFeatureCompleteEvent(data: string) {
  if (
    featureMode.value === FeatureModeEnum.EDITABLE &&
    featureSchema.value[featureMode.value]![aiProviderKey.value]!
      .WriteResponse &&
    featureSchema.value[featureMode.value]![aiProviderKey.value]!
      .WriteResponse === true
  ) {
    outputContent.value = data;
    writeOriginalActiveElementValue(startPart + outputContent.value + endPart);
  }
  if (
    quickFeatureCardRef.value &&
    quickFeatureCardRef.value.clientWidth > 700
  ) {
    width.value = 700;
  }
  isStarted.value = false;
  emits("complete", data, props.index);
}

function quickFeatureErrorEvent() {
  isStarted.value = false;
  emits("error", props.index);
}

async function handleFeatureClick(_featureSchema: FeatureSchema) {
  const id: string = _featureSchema.id;
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
  outputContent.value = "";
  popoverVisible.value = true;
  featureSchema.value = _featureSchema;
  isStarted.value = true;
  // isStreaming.value = true;
  emits("featureClick");
}

function close() {
  // const selection = window.getSelection();
  // selection!.removeAllRanges();
  popoverVisible.value = false;
  optionBarShow.value = false;
  logoShow.value = false;
  emits("close", props.index);
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

const clickOutside = () => {
  if (tidyDisplayOptionBarMode.value) {
    if (
      logoShow.value &&
      (!popoverVisible.value || isSidebar.value === SidebarMode.SIDEBAR)
    ) {
      close();
    }
  } else {
    if (
      logoShow.value &&
      (!popoverVisible.value || isSidebar.value === SidebarMode.SIDEBAR)
    ) {
      close();
    }
  }
};

const handleMousedownShadow = (event: Event) => {
  if (tidyDisplayOptionBarMode.value) {
    if (
      (logoRef.value && logoRef.value.contains(event.target as Node)) ||
      (optionBarRef.value && optionBarRef.value.contains(event.target as Node))
    ) {
      shadowClickInside = true;
    } else {
      shadowClickInside = false;
    }
  } else {
    if (
      (logoRef.value && logoRef.value.contains(event.target as Node)) ||
      (optionBarRef.value && optionBarRef.value.contains(event.target as Node))
    ) {
      shadowClickInside = true;
    } else {
      shadowClickInside = false;
    }
  }
};

const handleMousedown = (event: MouseEvent) => {
  if (
    (logoShow.value || optionBarShow.value) &&
    !drawer.value &&
    !shadowClickInside &&
    !iconMaximizeShow.value &&
    (!isStreaming.value || isSidebar.value === SidebarMode.SIDEBAR)
  ) {
    clickOutside();
  }
  shadowClickInside = false;
};

const handleKeyup = (event: KeyboardEvent) => {
  const pressedKey = event.key;
  if (pressedKey !== "Shift" && pressedKey !== "Meta" && !drawer.value) {
    if ((logoShow.value || optionBarShow.value) && !popoverVisible.value) {
      close();
    }
  }
};

const handleClickLogo = () => {
  optionBarShow.value = true;
};

const handleMinimize = () => {
  iconMaximizeShow.value = true;
  popoverVisible.value = false;
  logoShow.value = false;
  optionBarShow.value = false;
};

const handleGoback = () => {
  iconMaximizeShow.value = false;
  optionBarShow.value = true;
  popoverVisible.value = true;
  logoShow.value = true;
};

const handleCommand = (command: OptionCommandType) => {
  switch (command) {
    case OptionCommandType.SETTINGS:
      const data: IPCMessageType = {
        topic: IPCTopicEnum.COMMUNICATION,
        type: CommunicationMessageTypeEnum.OPEN_OPTIONS_PAGE,
        message: "Open options page",
      };
      consoleLog(LogLevelEnum.DEBUG, data);
      chrome.runtime.sendMessage(data, () => {});
      break;
  }
};

onMounted(async () => {
  consoleLog(LogLevelEnum.DEBUG, "Mounted PopupMenu");
  document.addEventListener("mousedown", handleMousedown);
  document.addEventListener("keyup", handleKeyup);
  const shadowHost = document.querySelector("cremind-app-extension");
  if (shadowHost) {
    const shadowRoot = shadowHost.shadowRoot;
    if (shadowRoot) {
      optionBarRef.value = shadowRoot.querySelector(
        ".popup-card-option-bar"
      ) as HTMLDivElement;
      popoverRef.value = shadowRoot.querySelector(
        ".popup-card-popover"
      ) as HTMLDivElement;
      logoRef.value = shadowRoot.querySelector(
        ".popup-card-cremind-logo"
      ) as HTMLDivElement;

      shadowRoot.addEventListener("mousedown", handleMousedownShadow);
      const resFeatures = await getJsonFeatures(
        true,
        1,
        MAXIMUM_FEATURES_SIZE_DEFAULT,
        null,
        null
      );
      featureList.value = resFeatures.list;
    }
  }

  if (!tidyDisplayOptionBarMode.value) {
    optionBarShow.value = props.show;
  } else {
    optionBarShow.value = false;
  }
  logoShow.value = props.show;
  iconMaximizeShow.value = false;

  const screenHeight = window.innerHeight + window.scrollY;
  const top = parseInt(props.top);
  if (screenHeight < top + 40) {
    optionBarTop.value = `${top - 60}px`;
    optionBarMarginTop.value = "-31px";
    optionBarMarginLeft.value = "24px";
  } else {
    optionBarMarginTop.value = "-6px";
    optionBarMarginLeft.value = "16px";
  }

  const activeElement = props.activeElement;
  if (props.featureMode === FeatureModeEnum.EDITABLE) {
    originalActiveElement.value = props.activeElement;
  }

  if (
    originalActiveElement.value &&
    originalActiveElement.value!.value !== undefined &&
    originalActiveElement.value!.value !== null
  ) {
    const startSelectionIndex = originalActiveElement.value!.selectionStart;
    const endSelectionIndex = originalActiveElement.value!.selectionEnd;
    const text = readOriginalActiveElementValue();
    startPart = text.slice(0, startSelectionIndex);
    endPart = text.slice(endSelectionIndex);
  } else if (
    /* prettier-ignore */
    originalActiveElement.value &&
          ((originalActiveElement.value!.innerText !== undefined &&
            originalActiveElement.value!.innerText !== null) ||
            (originalActiveElement.value!.textContent !== undefined &&
              originalActiveElement.value!.textContent !== null))
  ) {
    var selection = window.getSelection();
    let selectedText = selection!.toString().trim();
    var range = selection!.getRangeAt(0).cloneRange();
    range.selectNodeContents(activeElement);
    range.setEnd(
      selection!.getRangeAt(0).startContainer,
      selection!.getRangeAt(0).startOffset
    );
    const startSelectionIndex = range.toString().length;
    const endSelectionIndex = startSelectionIndex + selectedText.length;
    const text = readOriginalActiveElementValue();
    startPart = text.slice(0, startSelectionIndex);
    endPart = text.slice(endSelectionIndex);
  }
});

onUnmounted(() => {
  consoleLog(LogLevelEnum.DEBUG, "Unmounted PopupMenu");
  document.removeEventListener("mousedown", handleMousedown);
  document.removeEventListener("keyup", handleKeyup);
  const shadowHost = document.querySelector("cremind-app-extension");
  if (shadowHost) {
    const shadowRoot = shadowHost.shadowRoot;
    if (shadowRoot) {
      shadowRoot.removeEventListener("mousedown", handleMousedownShadow);
    }
  }
  emits("unmounted");
});
</script>

<style scoped>
/* @import "@/styles/components/PopupMenu.scss"; */
</style>

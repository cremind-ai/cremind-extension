<template>
  <div ref="outerRef" class="prompt-app-outer">
    <ElScrollbar ref="scrollbarRef" :maxHeight="scrollbarHeight">
      <div class="prompt-app-category-container">
        <div class="prompt-app-category-text">Category</div>
        <ElSelect
          class="prompt-app-category-block"
          v-model="currentCategory"
          placeholder="Categories"
          filterable
          @change="handleChangeCategory"
          @keydown="handleKey"
          @keyup="handleKey"
          @keypress="handleKey"
        >
          <ElOption
            v-for="option in CategoryOptions"
            :key="option"
            :label="option"
            :value="option"
          ></ElOption>
        </ElSelect>
        <ElTooltip :hide-after="0" content="Refer here" placement="bottom">
          <a
            href="https://github.com/f/awesome-chatgpt-prompts#prompts"
            target="_blank"
            style="margin-left: auto; margin-right: 50px"
          >
            <Icon
              icon="fa-brands:github"
              :style="{ fontSize: '25px' }"
              class="prompt-app-category-icon-github"
            />
          </a>
        </ElTooltip>
      </div>

      <div v-if="!initScrollbarHeight" class="prompt-app-grid">
        <div
          class="prompt-app-card"
          v-for="(feature, index) in filteredFeatureList"
          :key="index"
        >
          <PromptCardFeature
            :id="feature.id"
            :title="feature.title"
            :description="feature.description"
            :icon="feature.PROMPT?.Icon"
            @use="handleUseClick"
          ></PromptCardFeature>
        </div>
      </div>
    </ElScrollbar>

    <div class="prompt-app-pagination-block">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 40, 50]"
        :background="true"
        :small="true"
        layout="sizes, prev, pager, next, total"
        :total="totalFeaturesNumber"
        @size-change="handleSizeChange"
        @current-change="handleCurrentPageChange"
      />
    </div>

    <ElTooltip :hide-after="0" content="History" placement="top">
      <div class="prompt-app-button-history">
        <Icon
          icon="fluent:chat-12-filled"
          :style="{ fontSize: '40px' }"
          @click="handleHistoryBox"
        />
      </div>
    </ElTooltip>

    <ElButton
      v-show="historyBoxVisible"
      class="prompt-app-button-back"
      type="success"
      plain
      :icon="ArrowLeftBold"
      @click="handleBack"
      circle
    ></ElButton>

    <div v-show="historyBoxVisible" class="prompt-app-history-box">
      <Chat
        ref="chatRef"
        :chats="chats"
        @new-chat="newChat"
        v-model:blockSend="isStreaming"
      />
    </div>
  </div>
  <QuickFeatureCard
    :show="false"
    v-model:start="isStarted"
    v-model:is-streaming="isStreaming"
    v-model:drawer="drawer"
    :feature-mode="FeatureModeEnum.PROMPT"
    :feature-schema="featureSchema"
    @close="handleClose"
    @prompt="quickFeaturePromptEvent"
    @data="quickFeatureDataEvent"
    @complete="quickFeatureCompleteEvent"
    @error="quickFeatureErrorEvent"
  >
  </QuickFeatureCard>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { ArrowLeftBold } from "@element-plus/icons-vue";
import { ElTooltip } from "element-plus";
import { ElButton } from "element-plus";
import { ElScrollbar } from "element-plus";
import { ElPagination } from "element-plus";
import { ElSelect } from "element-plus";
import { ElOption } from "element-plus";
import { findIndex } from "lodash-es";
import { useUserSettingsStore } from "@/store/user_settings";
import {
  CategoryFeatureEnum,
  FeatureSchema,
  FeatureType,
} from "@/lib/features";
import {
  AIMode,
  ConversationRoleEnum,
  MAXIMUM_FEATURES_SIZE_DEFAULT,
} from "@/constants";
import { getJsonFeatures } from "@/lib/common";
import { FeatureModeEnum } from "@/types";
import { QuickFeatureCard } from "@/components";
import { PromptCardFeature } from "@/components";
import { Chat } from "@/components/Chat";
import { SystemVariableParser } from "@/lib";
import { ConversationMessageType } from "@/types/conversation";
import { consoleLog, LogLevelEnum } from "@/utils";

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
  activation: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits([
  "update:isStreaming",
  "update:drawerShow",
  "close",
  "newChat",
  "data",
  "complete",
  "error",
]);

const userSettings = useUserSettingsStore();

const aiProviderKey = computed(() => {
  if (userSettings.getAiProvider === AIMode.CHAT_GPT) {
    return "ChatGPT";
  } else if (userSettings.getAiProvider === AIMode.BARD) {
    return "Bard";
  }
  return "ChatGPT";
});

const PAGE_SIZE = 10;

const outerRef = ref<HTMLDivElement>();
const chatRef = ref<ComponentRef<typeof Chat>>();
const isStreaming = ref(props.isStreaming);
const isStarted = ref(false);
const drawer = ref(false);
const historyBoxVisible = ref(false);
const featureSchema: Ref<FeatureSchema> = ref({} as FeatureSchema);
const featureList: Ref<FeatureSchema[]> = ref([]);
const filteredFeatureList = computed(() => {
  const _filteredFeatureList = featureList.value.filter((feature) => {
    const { PROMPT } = feature;
    return PROMPT !== undefined && PROMPT![aiProviderKey.value] !== null;
  });
  return _filteredFeatureList;
});
const chats: Ref<ConversationMessageType[]> = ref([]);
const currentPage = ref(1);
const pageSize = ref(PAGE_SIZE);
const totalFeaturesNumber = ref(MAXIMUM_FEATURES_SIZE_DEFAULT);
const initScrollbarHeight = ref(true);
const scrollbarHeight = ref(0);
const currentCategory: Ref<CategoryFeatureEnum> = ref(CategoryFeatureEnum.ALL);
const CategoryOptions = Object.values(CategoryFeatureEnum);

let response = "";
let currentPrompt = "";

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
  () => props.activation,
  (value) => {
    if (value) {
      currentPageProcess(currentPage.value, currentCategory.value);
    }
  }
);

async function currentPageProcess(
  currentPage: number,
  category: CategoryFeatureEnum
) {
  const resFeatures = await getJsonFeatures(
    true,
    currentPage,
    pageSize.value,
    FeatureModeEnum.PROMPT,
    category
  );
  featureList.value = resFeatures.list;
  totalFeaturesNumber.value = resFeatures.total;
  if (initScrollbarHeight.value && outerRef.value!.clientHeight !== 0) {
    nextTick(() => {
      scrollbarHeight.value = outerRef.value!.clientHeight - 40;
      initScrollbarHeight.value = false;
    });
  }
}

function quickFeaturePromptEvent(data: string) {
  currentPrompt = data;
}

function quickFeatureDataEvent(data: string) {
  chats.value[chats.value.length - 1] = {
    role: ConversationRoleEnum.ASSISTANT,
    text: data,
  };
  nextTick(() => {
    chatRef.value?.scrollToBottom();
  });
  emits("data", data);
}

function quickFeatureCompleteEvent(data: string) {
  response = data;
  chats.value[chats.value.length - 1] = {
    role: ConversationRoleEnum.ASSISTANT,
    text: data,
  };

  nextTick(() => {
    chatRef.value?.scrollToBottom();
  });
  isStreaming.value = false;
  isStarted.value = false;
  emits("complete");
}

function quickFeatureErrorEvent() {
  isStarted.value = false;
  emits("error");
}

const handleChangeCategory = (value: string) => {
  const categoryEnum: CategoryFeatureEnum = value as CategoryFeatureEnum;
  currentPageProcess(currentPage.value, categoryEnum);
};

const handleUseClick = async (id: string) => {
  const resFeatures = await getJsonFeatures(
    true,
    1,
    MAXIMUM_FEATURES_SIZE_DEFAULT,
    null,
    null
  );
  const featureIndex = findIndex(resFeatures.list, {
    id: id!,
  });

  featureSchema.value = resFeatures.list[featureIndex];

  chats.value.push({
    role: ConversationRoleEnum.USER,
    text: featureSchema.value.PROMPT?.title!,
  });
  chats.value.push({
    role: ConversationRoleEnum.ASSISTANT,
    text: "",
  });

  nextTick(() => {
    chatRef.value?.scrollToBottom();
  });

  isStarted.value = true;
  historyBoxVisible.value = true;
};

const handleClose = () => {
  emits("close");
};

const handleHistoryBox = () => {
  historyBoxVisible.value = true;
};

const handleBack = () => {
  historyBoxVisible.value = false;
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPageProcess(currentPage.value, currentCategory.value);
};

const handleCurrentPageChange = (val: number) => {
  currentPageProcess(val, currentCategory.value);
};

const newChat = (value: string) => {
  let text = "";
  text += currentPrompt + "\n";
  text += "\\=\\=\\=\n";
  text += response + "\n";
  text += "\\=\\=\\=\n";
  text += value + "\n";
  emits("newChat", text);
  emits("close");
  response = "";
};

const close = () => {
  response = "";
  currentPage.value = 1;
  chats.value.splice(0, chats.value.length);
};

const handleKey = (event: Event | KeyboardEvent) => {
  event.stopPropagation();
};

onMounted(async () => {
  consoleLog(LogLevelEnum.DEBUG, "Mounted PromptApp");
  currentPageProcess(currentPage.value, currentCategory.value);
});

defineExpose({
  close,
});
</script>

<style scoped></style>

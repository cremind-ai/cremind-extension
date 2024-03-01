<template>
  <ElCard shadow="never" class="general-card">
    <ElCard shadow="never">
      <ElSwitch
        v-model="isDark"
        @change="handleDarkMode"
        style="margin-right: 10px"
      />
      Dark mode
    </ElCard>
  </ElCard>

  <ContentWrap title="Provider" class="general-child-card">
    <div class="card-horizontal-container">
      <ElCard
        shadow="hover"
        @click="
          handleGeneralSettingsClick(GeneralSettings.AI_PROVIDER_OPTION, 0)
        "
        :class="{
          'card-selected': generalState[GeneralSettings.AI_PROVIDER_OPTION][0],
        }"
      >
        <ImageDetailCard
          :filename="CHAT_GPT_LOGO"
          position="left"
          title="ChatGPT"
          image-height="100px"
          image-width="100px"
          width="300px"
        >
          <template #extra>
            <div v-if="isAuthenChatGPT">ChatGPT Authorized</div>
            <div v-else>
              ChatGPT Unauthorized. Please
              <a href="https://chat.openai.com/auth/login" target="_blank"
                >click here</a
              >
              to log in.
            </div>
            <ElRadioGroup v-model="selectedModel">
              <ElRadio
                v-for="model in chatgptModels"
                :key="model.model"
                :label="model.model"
              >
                {{ model.name }}
              </ElRadio>
            </ElRadioGroup>
          </template>
        </ImageDetailCard>
      </ElCard>
      <ElCard
        shadow="hover"
        @click="
          handleGeneralSettingsClick(GeneralSettings.AI_PROVIDER_OPTION, 1)
        "
        :class="{
          'card-selected': generalState[GeneralSettings.AI_PROVIDER_OPTION][1],
        }"
      >
        <ImageDetailCard
          :filename="CLAUDE_LOGO"
          position="left"
          title="Claude"
          image-height="100px"
          image-width="100px"
          width="300px"
        >
          <template #extra>
            <div v-if="isAuthenBard">Claude Authorized</div>
            <div v-else>
              Claude Unauthorized. Please
              <a href="https://claude.ai/login/" target="_blank">click here</a>
              to log in.
            </div>
          </template>
        </ImageDetailCard>
      </ElCard>
      <ElCard
        shadow="hover"
        @click="
          handleGeneralSettingsClick(GeneralSettings.AI_PROVIDER_OPTION, 2)
        "
        :class="{
          'card-selected': generalState[GeneralSettings.AI_PROVIDER_OPTION][2],
        }"
      >
        <ImageDetailCard
          :filename="BARD_LOGO"
          position="left"
          title="Google Gemini"
          image-height="100px"
          image-width="100px"
          width="300px"
        >
          <template #extra>
            <div v-if="isAuthenBard">Google Gemini Authorized</div>
            <div v-else>
              Google Gemini Unauthorized. Please
              <a href="https://bard.google.com/" target="_blank">click here</a>
              to log in.
            </div>
          </template>
        </ImageDetailCard>
      </ElCard>
    </div>
  </ContentWrap>

  <ContentWrap title="Sidebar" class="general-child-card">
    <div class="card-horizontal-container">
      <ElCard
        shadow="hover"
        @click="handleGeneralSettingsClick(GeneralSettings.SIDEBAR_OPTION, 0)"
        :class="{
          'card-selected': generalState[GeneralSettings.SIDEBAR_OPTION][0],
        }"
      >
        <ImageDetailCard
          :filename="SIDEBAR_IMG"
          position="left"
          title="Sidebar mode"
          content='"Cmd/Ctrl + Shift + Z" to enable/disable'
          image-height="100px"
          image-width="100px"
          width="400px"
        >
        </ImageDetailCard>
      </ElCard>
      <ElCard
        shadow="hover"
        @click="handleGeneralSettingsClick(GeneralSettings.SIDEBAR_OPTION, 1)"
        :class="{
          'card-selected': generalState[GeneralSettings.SIDEBAR_OPTION][1],
        }"
      >
        <ImageDetailCard
          :filename="WINDOWS_DIALOG_IMG"
          position="left"
          title="Windows dialog mode"
          image-height="100px"
          image-width="100px"
          width="400px"
        >
        </ImageDetailCard>
      </ElCard>
    </div>
  </ContentWrap>

  <ContentWrap title="MenuBar Display Mode" class="general-child-card">
    <div class="card-horizontal-container">
      <ElCard
        shadow="hover"
        @click="
          handleGeneralSettingsClick(GeneralSettings.TIDY_DISPLAY_OPTION, 0)
        "
        :class="{
          'card-selected': generalState[GeneralSettings.TIDY_DISPLAY_OPTION][0],
        }"
      >
        <ImageDetailCard
          title="Normal"
          content="Upon text selection, instantly access and utilize relevant features for swift and efficient task execution. Streamlined interface enhances productivity by eliminating unnecessary clicks."
          :filename="TIDY_DISPLAY_OPTION_IMG_1"
          position="bottom"
          width="470px"
          height="320px"
        >
        </ImageDetailCard>
      </ElCard>

      <ElCard
        shadow="hover"
        @click="
          handleGeneralSettingsClick(GeneralSettings.TIDY_DISPLAY_OPTION, 1)
        "
        :class="{
          'card-selected': generalState[GeneralSettings.TIDY_DISPLAY_OPTION][1],
        }"
      >
        <ImageDetailCard
          title="Tidy Icon"
          content="In this mode, a single representative logo replaces the feature menu when text is selected. Clicking the logo unveils the feature list. This streamlined approach offers a clean interface, ideal for users who prefer occasional feature access post text-selection, enhancing overall user comfort."
          :filename="TIDY_DISPLAY_OPTION_IMG_2"
          position="bottom"
          width="470px"
          height="320px"
        ></ImageDetailCard>
      </ElCard>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { watch, computed, onMounted, ref, Ref, reactive } from "vue";
import { ElCard } from "element-plus";
import { ElSwitch } from "element-plus";
import { ElRadioGroup } from "element-plus";
import { ElRadioButton } from "element-plus";
import { Icon } from "@iconify/vue";
import { ImageDetailCard, ContentWrap } from "@/components";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { useUserSettingsStore } from "@/store/user_settings";
import { useAPIStore, ChatGPTModel } from "@/store/api";
import {
  TIDY_DISPLAY_OPTION_IMG_1,
  TIDY_DISPLAY_OPTION_IMG_2,
  SIDEBAR_IMG,
  WINDOWS_DIALOG_IMG,
  BARD_LOGO,
  CHAT_GPT_LOGO,
  CLAUDE_LOGO,
  AIMode,
} from "@/constants";
import { LLM } from "@/lib/llm";
import { Status } from "@/constants/status";
import { SidebarMode } from "@/types/ui";

enum GeneralSettings {
  AI_PROVIDER_OPTION = "AI_PROVIDER_OPTION",
  SIDEBAR_OPTION = "SIDEBAR_OPTION",
  TIDY_DISPLAY_OPTION = "TIDY_DISPLAY_OPTION",
}

const userSettings = useUserSettingsStore();
const api = useAPIStore();

const isDark = ref(userSettings.getIsDark);

const generalState = reactive({
  [GeneralSettings.AI_PROVIDER_OPTION]: [
    userSettings.getAiProvider === AIMode.CHAT_GPT,
    userSettings.getAiProvider === AIMode.CLAUDE,
    userSettings.getAiProvider === AIMode.BARD,
  ],
  [GeneralSettings.SIDEBAR_OPTION]: [
    userSettings.getSidebar === SidebarMode.SIDEBAR,
    userSettings.getSidebar === SidebarMode.WINDOWS,
  ],
  [GeneralSettings.TIDY_DISPLAY_OPTION]: [
    userSettings.getTidyDisplayOptionBarMode === false,
    userSettings.getTidyDisplayOptionBarMode === true,
  ],
});

const isAuthenChatGPT = ref(false);
const isAuthenClaude = ref(false);
const isAuthenBard = ref(false);

const chatgptModels = ref<ChatGPTModel[]>([]);
const selectedModel = ref(userSettings.getChatgptModel);

const llm = new LLM();

watch(
  () => userSettings.getIsDark,
  (value) => {
    isDark.value = value;
  }
);

watch(
  () => userSettings.getAiProvider,
  async (value) => {
    const res = await llm.authentication({ aiProvider: value });
    if (value === AIMode.CHAT_GPT) {
      if (res.status === Status.SUCCESS) {
        isAuthenChatGPT.value = true;
      } else {
        isAuthenChatGPT.value = false;
      }
    } else if (value === AIMode.CLAUDE) {
      if (res.status === Status.SUCCESS) {
        isAuthenClaude.value = true;
      } else {
        isAuthenClaude.value = false;
      }
    } else if (value === AIMode.BARD) {
      if (res.status === Status.SUCCESS) {
        isAuthenBard.value = true;
      } else {
        isAuthenBard.value = false;
      }
    }
  }
);

watch(
  () => userSettings.getChatgptModel,
  (value) => {
    selectedModel.value = value;
  }
);

watch(
  () => selectedModel.value,
  (value) => {
    userSettings.setChatgptModel(value);
  }
);

const handleDarkMode = () => {
  userSettings.setIsDark(isDark.value);
};

const handleGeneralSettingsClick = async (
  generalSettings: GeneralSettings,
  option: number
) => {
  if (generalState[generalSettings][option] === true) {
    return;
  }
  for (let i in generalState[generalSettings]) {
    generalState[generalSettings][i] = false;
  }
  generalState[generalSettings][option] = true;

  switch (generalSettings) {
    case GeneralSettings.AI_PROVIDER_OPTION:
      if (option === 0) {
        userSettings.setAIProvider(AIMode.CHAT_GPT);
      } else if (option === 1) {
        userSettings.setAIProvider(AIMode.CLAUDE);
      } else if (option === 2) {
        userSettings.setAIProvider(AIMode.BARD);
      }
      break;
    case GeneralSettings.SIDEBAR_OPTION:
      if (option === 0) {
        userSettings.setSidebar(SidebarMode.SIDEBAR);
      } else {
        userSettings.setSidebar(SidebarMode.WINDOWS);
      }
      break;
    case GeneralSettings.TIDY_DISPLAY_OPTION:
      if (option === 0) {
        userSettings.setTidyDisplayOptionBarMode(false);
      } else {
        userSettings.setTidyDisplayOptionBarMode(true);
      }
      break;
  }
};

onMounted(async () => {
  const res = await llm.authentication({
    aiProvider: userSettings.getAiProvider,
  });
  if (userSettings.getAiProvider === AIMode.CHAT_GPT) {
    if (res.status === Status.SUCCESS) {
      isAuthenChatGPT.value = true;
    } else {
      isAuthenChatGPT.value = false;
    }
  } else if (userSettings.getAiProvider === AIMode.BARD) {
    if (res.status === Status.SUCCESS) {
      isAuthenBard.value = true;
    } else {
      isAuthenBard.value = false;
    }
  } else if (userSettings.getAiProvider === AIMode.CLAUDE) {
    if (res.status === Status.SUCCESS) {
      isAuthenBard.value = true;
    } else {
      isAuthenBard.value = false;
    }
  }
  try {
    chatgptModels.value = await api.getChatgptModels();
    const foundModel = chatgptModels.value.find(
      (item) => item.model === userSettings.getChatgptModel
    );
    if (foundModel) {
      userSettings.setChatgptModel(foundModel.model);
    } else {
      userSettings.setChatgptModel(chatgptModels.value[0].model);
    }
  } catch (e) {}
});
</script>

<style scoped>
.general-card {
  font-size: 14px;
}

:deep(.general-card .el-card__body) {
  padding: 20px;
}

.general-child-card {
  margin-top: 10px;
}

.card-horizontal-container {
  display: flex;
  /* flex-direction: row;
  justify-content: space-between; */
  gap: 20px;
  width: 100%;
}

.card-selected {
  background-color: var(--cremind-logo-color);
}
</style>

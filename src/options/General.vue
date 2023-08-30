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
          :filename="BARD_LOGO"
          position="left"
          title="Google Bard"
          image-height="100px"
          image-width="100px"
          width="300px"
        >
          <template #extra>
            <div v-if="isAuthenBard">Google Bard Authorized</div>
            <div v-else>
              Google Bard Unauthorized. Please
              <a href="https://bard.google.com/" target="_blank">click here</a>
              to log in.
            </div>
          </template>
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
          width="510px"
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
          width="510px"
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
import { Icon } from "@iconify/vue";
import { ImageDetailCard, ContentWrap } from "@/components";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { useUserSettingsStore } from "@/store/user_settings";
import {
  TIDY_DISPLAY_OPTION_IMG_1,
  TIDY_DISPLAY_OPTION_IMG_2,
  BARD_LOGO,
  CHAT_GPT_LOGO,
  AIMode,
} from "@/constants";
import { LLM } from "@/lib/llm";
import { Status } from "@/constants/status";

enum GeneralSettings {
  AI_PROVIDER_OPTION = "AI_PROVIDER_OPTION",
  TIDY_DISPLAY_OPTION = "TIDY_DISPLAY_OPTION",
}

const userSettings = useUserSettingsStore();

const isDark = ref(userSettings.getIsDark);

const generalState = reactive({
  [GeneralSettings.AI_PROVIDER_OPTION]: [
    userSettings.getAiProvider === AIMode.CHAT_GPT,
    userSettings.getAiProvider === AIMode.BARD,
  ],
  [GeneralSettings.TIDY_DISPLAY_OPTION]: [
    userSettings.getTidyDisplayOptionBarMode === false,
    userSettings.getTidyDisplayOptionBarMode === true,
  ],
});

const isAuthenChatGPT = ref(false);
const isAuthenBard = ref(false);

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
    } else if (value === AIMode.BARD) {
      if (res.status === Status.SUCCESS) {
        isAuthenBard.value = true;
      } else {
        isAuthenBard.value = false;
      }
    }
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
      } else {
        userSettings.setAIProvider(AIMode.BARD);
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
  }
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

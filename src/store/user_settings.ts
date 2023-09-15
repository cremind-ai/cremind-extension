import { defineStore } from "pinia";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { AIMode } from "@/constants";
import { SidebarMode } from "@/types/ui";

interface UserSettingsState {
  isDark: boolean;
  sidebar: SidebarMode;
  aiProvider: AIMode;
  tidyDisplayOptionBarMode: boolean;
}

export const useUserSettingsStore = defineStore({
  id: "UserSettings",
  state: (): UserSettingsState => {
    return {
      isDark: false,
      sidebar: SidebarMode.SIDEBAR,
      aiProvider: AIMode.CHAT_GPT,
      tidyDisplayOptionBarMode: false,
    };
  },
  getters: {
    getIsDark(): boolean {
      return this.isDark;
    },
    getSidebar(): SidebarMode {
      return this.sidebar;
    },
    getAiProvider(): AIMode {
      return this.aiProvider;
    },
    getTidyDisplayOptionBarMode(): boolean {
      return this.tidyDisplayOptionBarMode;
    },
  },
  actions: {
    applyDarkModeClass(force: boolean) {
      if (!document.documentElement.classList.contains("dark") || force) {
        if (this.isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    applySidebarClass() {
      const htmlRootElement = document.querySelector("html");
      if (this.sidebar === SidebarMode.SIDEBAR) {
        htmlRootElement!.style.width = "calc(100% - 450px)";
        htmlRootElement!.style.setProperty(
          "width",
          "calc(100% - 450px)",
          "important"
        );
      } else {
        htmlRootElement!.style.removeProperty("width");
      }
    },
    async initialize(isSettingPage: boolean) {
      const storedSettingsJSON = await ChromeStorage.getInstance().get(
        "USER_SETTINGS"
      );
      if (storedSettingsJSON === undefined) {
        await this.updateSettingsInStorage();
      } else {
        const storedSettings: UserSettingsState =
          JSON.parse(storedSettingsJSON);
        Object.assign(this, storedSettings);
      }
      this.applyDarkModeClass(false);
      if (!isSettingPage) {
        this.applySidebarClass();
      }
    },
    async setIsDark(isDark: boolean) {
      this.isDark = isDark;
      await this.updateSettingsInStorage();
      this.applyDarkModeClass(true);
    },
    async setSidebar(sidebar: SidebarMode) {
      this.sidebar = sidebar;
      await this.updateSettingsInStorage();
    },
    async setAIProvider(aiProvider: AIMode) {
      this.aiProvider = aiProvider;
      await this.updateSettingsInStorage();
    },
    async setTidyDisplayOptionBarMode(tidyDisplayOptionBarMode: boolean) {
      this.tidyDisplayOptionBarMode = tidyDisplayOptionBarMode;
      await this.updateSettingsInStorage();
    },
    async updateSettingsInStorage() {
      const settingsToStore: UserSettingsState = {
        isDark: this.isDark,
        sidebar: this.sidebar,
        aiProvider: this.aiProvider,
        tidyDisplayOptionBarMode: this.tidyDisplayOptionBarMode,
      };
      await ChromeStorage.getInstance().set(
        "USER_SETTINGS",
        JSON.stringify(settingsToStore)
      );
    },
  },
});

import { defineStore } from "pinia";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { AIMode } from "@/constants";
import { SidebarMode } from "@/types/ui";

interface UserSettingsState {
  isDark: boolean;
  sidebar: SidebarMode;
  aiProvider: AIMode;
  tidyDisplayOptionBarMode: boolean;
  chatgptModel: string;
}

export const useUserSettingsStore = defineStore({
  id: "UserSettings",
  state: (): UserSettingsState => {
    return {
      isDark: false,
      sidebar: SidebarMode.SIDEBAR,
      aiProvider: AIMode.CHAT_GPT,
      tidyDisplayOptionBarMode: false,
      chatgptModel: "auto",
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
    getChatgptModel(): string {
      return this.chatgptModel;
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
    applySidebarClass(isolation: boolean, sidebar: SidebarMode | null) {
      const htmlRootElement = document.querySelector("html");
      let _sidebar = this.sidebar;
      if (isolation && sidebar) {
        _sidebar = sidebar;
      }
      if (_sidebar === SidebarMode.SIDEBAR) {
        htmlRootElement!.style.width = "calc(100% - 450px)";
        htmlRootElement!.style.setProperty(
          "width",
          "calc(100% - 450px)",
          "important"
        );
        htmlRootElement!.style.position = "relative";
        htmlRootElement!.style.setProperty("position", "relative");
      } else {
        htmlRootElement!.style.removeProperty("width");
        htmlRootElement!.style.removeProperty("position");
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
        this.applySidebarClass(false, null);
      }
    },
    async setIsDark(isDark: boolean) {
      this.isDark = isDark;
      await this.updateSettingsInStorage();
      this.applyDarkModeClass(true);
    },
    async setSidebar(sidebar: SidebarMode) {
      this.sidebar = sidebar;
      if (sidebar === SidebarMode.NONE) {
        this.sidebar = SidebarMode.SIDEBAR;
      }
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
    async setChatgptModel(chatgptModel: string) {
      this.chatgptModel = chatgptModel;
      await this.updateSettingsInStorage();
    },
    async updateSettingsInStorage() {
      const settingsToStore: UserSettingsState = {
        isDark: this.isDark,
        sidebar: this.sidebar,
        aiProvider: this.aiProvider,
        tidyDisplayOptionBarMode: this.tidyDisplayOptionBarMode,
        chatgptModel: this.chatgptModel,
      };
      await ChromeStorage.getInstance().set(
        "USER_SETTINGS",
        JSON.stringify(settingsToStore)
      );
    },
  },
});

import { defineStore } from "pinia";
import { ChromeStorage } from "@/hooks/chrome_storage";

interface UserSettingsState {
  isDark: boolean;
}

export const useUserSettingsStore = defineStore({
  id: "UserSettings",
  state: (): UserSettingsState => {
    return {
      isDark: false,
    };
  },
  getters: {
    getIsDark(): boolean {
      return this.isDark;
    },
  },
  actions: {
    applyDarkModeClass() {
      if (this.isDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    },
    async initialize() {
      const storedSettingsJSON = await ChromeStorage.getInstance().get(
        "USER_SETTINGS"
      );
      if (storedSettingsJSON !== undefined) {
        const storedSettings: UserSettingsState =
          JSON.parse(storedSettingsJSON);
        Object.assign(this, storedSettings);
        this.applyDarkModeClass();
      }
    },
    async setIsDark(isDark: boolean) {
      this.isDark = isDark;
      await this.updateSettingsInStorage();
      this.applyDarkModeClass();
    },
    async updateSettingsInStorage() {
      const settingsToStore: UserSettingsState = {
        isDark: this.isDark,
      };
      await ChromeStorage.getInstance().set(
        "USER_SETTINGS",
        JSON.stringify(settingsToStore)
      );
    },
  },
});

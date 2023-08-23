import { defineStore } from "pinia";

export enum VisibleManagerTypeEnum {
  LOGO = "LOGO",
  POPUP_CARD = "POPUP_CARD",
  CHAT_DIALOG = "CHAT_DIALOG",
  APP_DIALOG = "APP_DIALOG",
}

interface VisibleManagerState {
  visibleStates: { [key: string]: boolean };
}

export const useVisibleManagerStore = defineStore({
  id: "VisibleManager",
  state: (): VisibleManagerState => {
    return {
      visibleStates: {},
    };
  },
  getters: {
    getVisible:
      (state) =>
      (type: VisibleManagerTypeEnum): boolean => {
        return state.visibleStates[type];
      },
    getVisibles(): { [key: string]: boolean } {
      return this.visibleStates;
    },
  },
  actions: {
    register(type: VisibleManagerTypeEnum) {
      this.visibleStates[type] = false;
    },
    resetShow() {
      for (const key in this.visibleStates) {
        this.visibleStates[key] = false;
      }
      this.visibleStates[VisibleManagerTypeEnum.LOGO] = true;
    },
    takeVisible(type: VisibleManagerTypeEnum) {
      for (const key in this.visibleStates) {
        if (type === key) {
          this.visibleStates[key] = true;
        } else {
          this.visibleStates[key] = false;
        }
      }
    },
  },
});

import { defineStore } from "pinia";

interface ChatDialogState {
  chatDialogVisible: boolean;
  initialPrompt: string | null;
}

export const useChatDialogStore = defineStore({
  id: "ChatDialog",
  state: (): ChatDialogState => {
    return {
      chatDialogVisible: false,
      initialPrompt: null,
    };
  },
  getters: {
    getChatDialogVisible(): boolean {
      return this.chatDialogVisible;
    },
    getInitialPrompt(): string | null {
      return this.initialPrompt;
    },
  },
  actions: {
    setChatDialogVisible(status: boolean) {
      this.chatDialogVisible = status;
    },
    setInitialPrompt(prompt: string | null) {
      this.initialPrompt = prompt;
    },
  },
});

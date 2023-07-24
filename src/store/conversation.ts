import { defineStore } from "pinia";
import { ConversationMessageType } from "../types/conversation";

interface ConversationState {
  conversations: ConversationMessageType[];
}

export const useConversationStore = defineStore({
  id: "conversation",
  state: (): ConversationState => {
    return {
      conversations: [],
    };
  },
  getters: {
    getConversations(): ConversationMessageType[] {
      return this.conversations;
    },
  },
  actions: {
    setConversations(list: ConversationMessageType[]): void {
      this.conversations = list;
    },
    addingNewMessage(payload: ConversationMessageType) {
      this.conversations!.push(payload);
    },
    updateLastMessage(payload: ConversationMessageType) {
      this.conversations![this.conversations!.length - 1] = payload;
    },
  },
});

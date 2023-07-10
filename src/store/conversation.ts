import {
  CommunicationMessageType,
  CommunicationMessageTopicEnum,
  CommunicationMessageTypeEnum,
} from "../types";
import { defineStore } from "pinia";
import { status } from "../constants/status";

export const useConversationStore = defineStore({
  id: "conversation",
  state: () => ({}),
  getters: {},
  actions: {
    async request(
      prompt: string,
      isStream: boolean,
      sendMsgCallback: (data: CommunicationMessageType) => void
    ): Promise<
      (
        callback: (data: CommunicationMessageType) => void
      ) => (data: CommunicationMessageType) => void
    > {
      return new Promise<
        (
          callback: (data: CommunicationMessageType) => void
        ) => (data: CommunicationMessageType) => void
      >((resolve, reject) => {});
    },
  },
});

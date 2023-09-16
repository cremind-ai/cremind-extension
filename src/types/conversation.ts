import { ConversationRoleEnum } from "@/constants";

export type ConversationMessageType = {
  role: ConversationRoleEnum;
  text: string;
};

export enum ConversationModeEnum {
  NORMAL = 0,
  REGENERATE = 1,
  CONTINUE = 2,
}

export type ConversationContextType = {
  conversationId: string | null;
  messageId: string | null;
  childMessageId: string | null;
  contextIds: string[][];
  endTurn: boolean;
  saveConversation: boolean;
  currentPrompt: string | null;
};

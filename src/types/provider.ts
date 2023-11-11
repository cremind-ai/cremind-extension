import { AIMode } from "@/constants";
import { ConversationModeEnum } from "./conversation";

export enum AIResponseTypeEnum {
  MESSAGE = "message",
  COMPLETE = "complete",
  ERROR = "error",
}

export type AIPayloadType = {
  aiProvider: AIMode;
  modelName?: string;
  conversationMode?: ConversationModeEnum;
  conversationId?: string;
  messageId?: string;
  childMessageId?: string;
  contextIds?: string[][];
  deleteConversation?: boolean;
};

export type AIResponseType = {
  type: AIResponseTypeEnum;
  message?: string;
  code?: number;
  payload?: {
    conversationId?: string;
    messageId?: string;
    childMessageId?: string;
    endTurn?: boolean;
    contextIds?: string[];
  };
};

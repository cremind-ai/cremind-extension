export enum AIResponseTypeEnum {
  MESSAGE = "message",
  COMPLETE = "complete",
  ERROR = "error",
}

export type AIResponseType = {
  type: AIResponseTypeEnum;
  message?: string;
  code?: number;
  payload?: {
    conversationId?: string;
    messageId?: string;
    childMessageId?: string;
    endTurn?: boolean;
  };
};

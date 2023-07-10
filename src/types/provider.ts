export enum AIResponseTypeEnum {
  MESSAGE = "message",
  COMPLETE = "complete",
  ERROR = "error",
}

export type AIResponseType = {
  type: AIResponseTypeEnum;
  message?: string;
  code?: number;
};

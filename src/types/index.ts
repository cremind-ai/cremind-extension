export enum CommunicationMessageTypeEnum {
  STREAM = "stream",
  MESSAGE = "message",
  COMPLETE = "complete",
  ERROR = "error",
}

export enum CommunicationMessageTopicEnum {
  CONVERSATION = "conversation",
}

export type CommunicationMessageType = {
  topic: CommunicationMessageTopicEnum;
  type: CommunicationMessageTypeEnum;
  requestId: string;
  payload?: any;
  message?: string;
  code?: number;
};

export enum selectedModeEnum {
  READONLY = "READONLY",
  EDITABLE = "EDITABLE",
  EDITABLE_NO_CONTENT = "EDITABLE_NO_CONTENT",
}

export enum LLMMODE {
  DELETE_CONVERSATION = "DELETE_CONVERSATION",
  STOP_GENERATING = "STOP_GENERATING",
  COMMUNICATION = "COMMUNICATION",
}

export enum ConversationMessageTypeEnum {
  STREAM = "stream",
  MESSAGE = "message",
  COMPLETE = "complete",
  ERROR = "error",
}

export enum CommunicationMessageTypeEnum {
  GET_FEATURES = "get_features",
  OPEN_OPTIONS_PAGE = "open_options_page",
  MESSAGE = "message",
  ERROR = "error",
}

export enum IPCTopicEnum {
  CONVERSATION = "conversation",
  COMMUNICATION = "communication",
}

export type IPCMessageType = {
  topic: IPCTopicEnum;
  type: ConversationMessageTypeEnum | CommunicationMessageTypeEnum;
  requestId?: string;
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

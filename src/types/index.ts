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

export type ResPayloadType = {
  status: number;
  msg: string;
  payload?: any;
  requestId?: string;
  code?: number;
};

export type IPCMessageType = {
  topic: IPCTopicEnum;
  type: ConversationMessageTypeEnum | CommunicationMessageTypeEnum;
  requestId?: string;
  payload?: any;
  message?: string;
  code?: number;
};

export enum featureModeEnum {
  READONLY = "READONLY",
  EDITABLE = "EDITABLE",
  READONLY_CONTEXT_MENU = "READONLY_CONTEXT_MENU",
  EDITABLE_CONTEXT_MENU = "EDITABLE_CONTEXT_MENU",
  APP = "APP",
}

export enum LLMMODE {
  DELETE_CONVERSATION = "DELETE_CONVERSATION",
  STOP_GENERATING = "STOP_GENERATING",
  AUTHENTICATION = "AUTHENTICATION",
  COMMUNICATION = "COMMUNICATION",
}

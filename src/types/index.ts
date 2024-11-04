export enum ConversationMessageTypeEnum {
  STREAM = "stream",
  MESSAGE = "message",
  COMPLETE = "complete",
  ERROR = "error",
}

export enum CommunicationMessageTypeEnum {
  GET_FEATURES = "get_features",
  SET_FEATURES = "set_features",
  GET_ARKOSE_TOKEN = "get_arkose_token",
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

export enum FeatureModeEnum {
  READONLY = "READONLY",
  EDITABLE = "EDITABLE",
  PROMPT = "PROMPT",
  UPLOAD = "UPLOAD",
}

export enum LLMMODE {
  DELETE_CONVERSATION = "DELETE_CONVERSATION",
  STOP_GENERATING = "STOP_GENERATING",
  AUTHENTICATION = "AUTHENTICATION",
  COMMUNICATION = "COMMUNICATION",
}

export enum OpenAIAuthMode {
  CHATGPT_NOAUTH = "chatgpt-noauth",
  CHATGPT_FREE = "chatgpt-free",
  CHATGPT_PLUS = "chatgpt-plus",
}

export enum ClaudeAuthMode {
  CLAUDE_FREE = "claude-free",
}

export enum GeminiAuthMode {
  GEMINI_FREE = "gemini-free",
}

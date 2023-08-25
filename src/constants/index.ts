export const CONTENT_SCRIPT_PORT_NAME = "IPC";
export enum AIMode {
  OPENAI_API = "OPENAI_API",
  CHAT_GPT = "CHAT_GPT",
  BARD = "BARD",
}

export enum ConversationRoleEnum {
  USER = 0,
  ASSISTANT = 1,
}

export enum OperatingSystemEnum {
  WINDOWS = "WINDOWS",
  MACOS = "MACOS",
  UNIX = "UNIX",
  LINUX = "LINUX",
}

export const APP_RETRY_TIME = 10000;
export const APP_MAX_RETRIES = 20;
export const APP_MAX_CHUNKSIZE = 5000;

export const LOGO_COLOR = "#4a1568";
export const LOGO_COLOR_DARK = "#6e4486";

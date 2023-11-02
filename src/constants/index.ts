export const CONTENT_SCRIPT_PORT_NAME = "IPC";
export enum AIMode {
  OPENAI_API = "OPENAI_API",
  CHAT_GPT = "CHAT_GPT",
  BARD = "BARD",
  CLAUDE = "CLAUDE",
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
export const APP_CHAT_GPT_MAX_CHUNKSIZE = 5000;
export const APP_BARD_MAX_CHUNKSIZE = 8000;
export const APP_CLAUDE_MAX_CHUNKSIZE = 10000;

export const LOGO_COLOR = "#4a1568";
export const LOGO_COLOR_DARK = "#6e4486";

export const TIDY_DISPLAY_OPTION_IMG_1 = "settings/display_mode1.gif";
export const TIDY_DISPLAY_OPTION_IMG_2 = "settings/display_mode2.gif";

export const BARD_LOGO = "3rd_logo/Bard-logo-200.png";
export const CLAUDE_LOGO = "3rd_logo/Claude-icon-256.png";
export const CHAT_GPT_LOGO = "3rd_logo/ChatGPT-logo-64.png";

export const SIDEBAR_IMG = "settings/sidebar-r-200.png";
export const WINDOWS_DIALOG_IMG = "settings/window-200.png";

export const AI_SYSTEM_RESPONSE_START_BLOCK = "AI_SYSTEM_RESPONSE_START_BLOCK";
export const AI_SYSTEM_RESPONSE_END_BLOCK = "AI_SYSTEM_RESPONSE_END_BLOCK";

export const MAXIMUM_FEATURES_SIZE_DEFAULT = -1;

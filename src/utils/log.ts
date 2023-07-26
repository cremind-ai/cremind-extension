const logLevel: LogLevelEnum = process.env.VUE_APP_LOG_LEVEL as LogLevelEnum;

export enum LogLevelEnum {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  NONE = "none",
}

export function consoleLog(level: LogLevelEnum, ...args) {
  switch (level) {
    case LogLevelEnum.DEBUG:
      if (logLevel === LogLevelEnum.DEBUG) {
        console.log(...args);
      }
      break;
    case LogLevelEnum.INFO:
      if (logLevel === LogLevelEnum.INFO) {
        console.info(...args);
      }
      break;
    case LogLevelEnum.WARN:
      if (logLevel === LogLevelEnum.WARN) {
        console.warn(...args);
      }
      break;
    case LogLevelEnum.ERROR:
      if (logLevel === LogLevelEnum.ERROR) {
        console.error(...args);
      }
      break;
    default:
      break;
  }
}

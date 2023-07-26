import { CWException } from "../types/exception";
import {
  IPCTopicEnum,
  IPCMessageType,
  ConversationMessageTypeEnum,
} from "../types";
import { CONTENT_SCRIPT_PORT_NAME } from "../constants";

export class IPCHostException extends CWException {}

export class IPCHost {
  private static instance: IPCHost;
  private NAME = CONTENT_SCRIPT_PORT_NAME;
  private registeredCallbacks: {
    [key in IPCTopicEnum]: (
      data: IPCMessageType,
      sendResponse: (type: ConversationMessageTypeEnum, response?: any) => void
    ) => void;
  } = {
    [IPCTopicEnum.CONVERSATION]: () => {},
    [IPCTopicEnum.COMMUNICATION]: () => {},
  };

  private constructor() {}

  public static getInstance(): IPCHost {
    if (!IPCHost.instance) {
      IPCHost.instance = new IPCHost();
    }
    return IPCHost.instance;
  }

  public initConnection(): IPCHost {
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === this.NAME) {
        port.onMessage.addListener(async (data: IPCMessageType) => {
          const { topic } = data;
          if (this.registeredCallbacks[topic]) {
            this.registeredCallbacks[topic](
              data,
              (type: ConversationMessageTypeEnum, response?: any) => {
                this.sendResponse(port, data, type, response);
              }
            );
          }
        });
      }
    });
    return this;
  }

  private sendResponse(
    port: chrome.runtime.Port,
    request: IPCMessageType,
    type: ConversationMessageTypeEnum,
    response?: any
  ) {
    const fullResponse: IPCMessageType = {
      payload: response,
      type: type,
      topic: request.topic,
      requestId: request.requestId,
    };
    port.postMessage(fullResponse);
  }

  public register(
    topic: IPCTopicEnum,
    callback: (
      data: IPCMessageType,
      sendResponse: (type: ConversationMessageTypeEnum, response?: any) => void
    ) => void
  ) {
    this.registeredCallbacks[topic] = callback;
  }
}

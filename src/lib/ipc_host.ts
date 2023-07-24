import { CWException } from "../types/exception";
import {
  CommunicationMessageTopicEnum,
  CommunicationMessageType,
  CommunicationMessageTypeEnum,
} from "../types";
import { CONTENT_SCRIPT_PORT_NAME } from "../constants";

export class IPCHostException extends CWException {}

export class IPCHost {
  private static instance: IPCHost;
  private NAME = CONTENT_SCRIPT_PORT_NAME;
  private registeredCallbacks: {
    [key in CommunicationMessageTopicEnum]: (
      data: CommunicationMessageType,
      sendResponse: (type: CommunicationMessageTypeEnum, response?: any) => void
    ) => void;
  } = {
    [CommunicationMessageTopicEnum.CONVERSATION]: () => {},
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
        port.onMessage.addListener(async (data: CommunicationMessageType) => {
          const { topic } = data;
          if (this.registeredCallbacks[topic]) {
            this.registeredCallbacks[topic](
              data,
              (type: CommunicationMessageTypeEnum, response?: any) => {
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
    request: CommunicationMessageType,
    type: CommunicationMessageTypeEnum,
    response?: any
  ) {
    const fullResponse: CommunicationMessageType = {
      payload: response,
      type: type,
      topic: request.topic,
      requestId: request.requestId,
    };
    port.postMessage(fullResponse);
  }

  public register(
    topic: CommunicationMessageTopicEnum,
    callback: (
      data: CommunicationMessageType,
      sendResponse: (type: CommunicationMessageTypeEnum, response?: any) => void
    ) => void
  ) {
    this.registeredCallbacks[topic] = callback;
  }
}

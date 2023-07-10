import { CWException } from "../types/exception";
import { status } from "../constants/status";
import { EventEmitter } from "../utils/event_emitter";
import { uuid } from "../utils";
import {
  CommunicationMessageTopicEnum,
  CommunicationMessageType,
  CommunicationMessageTypeEnum,
} from "../types";
import { CONTENT_SCRIPT_PORT_NAME } from "../constants/common";

export class IPCClientException extends CWException {}

export class IPCClient {
  private static instance: IPCClient;
  private NAME = CONTENT_SCRIPT_PORT_NAME;
  private port: chrome.runtime.Port | null = null;
  public timeout: number = 30000;
  private ipcEmitter = new EventEmitter();

  private constructor() {}

  public static getInstance(): IPCClient {
    if (!IPCClient.instance) {
      IPCClient.instance = new IPCClient();
      IPCClient.instance.initConnection();
    }
    return IPCClient.instance;
  }

  private connect() {
    this.port = chrome.runtime.connect({ name: this.NAME });
    this.port.onMessage.addListener((data: CommunicationMessageType) => {
      this.ipcEmitter.emit(data.requestId, data);
    });
  }

  private initConnection(): IPCClient {
    this.connect();
    this.port!.onDisconnect.addListener(() => {
      this.connect();
    });

    return this;
  }

  public async sendMessage(data: any) {
    try {
      this.port!.postMessage(data);
    } catch (err) {
      this.port = chrome.runtime.connect({ name: this.NAME });
      this.connect();
      this.port.postMessage(data);
    }
  }

  public async response(
    isStream: boolean,
    topic: CommunicationMessageTopicEnum,
    timeout: number,
    requestId: string
  ): Promise<any | EventEmitter> {
    return new Promise(async (resolve, reject) => {
      if (!isStream) {
        const timeoutObj = setTimeout(() => {
          this.ipcEmitter.emit(requestId, {
            topic: topic,
            type: CommunicationMessageTypeEnum.ERROR,
            code: status.IPC_RESPONSE_TIMEOUT,
            message: "IPC response timeout",
            requestId: requestId,
          });
          reject(
            new IPCClientException(
              status.IPC_RESPONSE_TIMEOUT,
              "IPC response timeout"
            )
          );
        }, timeout);
        this.ipcEmitter.once(requestId, (data: CommunicationMessageType) => {
          if (data && data.code !== status.IPC_RESPONSE_TIMEOUT) {
            resolve(data);
            clearTimeout(timeoutObj);
          }
        });
      } else {
        const emitter = new EventEmitter();
        let timeoutObj: NodeJS.Timeout;

        const resetTimeout = () => {
          clearTimeout(timeoutObj);
          timeoutObj = setTimeout(() => {
            this.ipcEmitter.emit(requestId, {
              topic: topic,
              type: CommunicationMessageTypeEnum.ERROR,
              code: status.IPC_RESPONSE_TIMEOUT,
              message: "IPC response timeout",
              requestId: requestId,
            });
            this.ipcEmitter.removeListener(requestId, messageHandler);
          }, timeout);
        };

        const messageHandler = (data: CommunicationMessageType) => {
          if (data && data.type === CommunicationMessageTypeEnum.STREAM) {
            resetTimeout();
            emitter.emit("data", data);
          } else if (
            data &&
            data.type === CommunicationMessageTypeEnum.COMPLETE
          ) {
            clearTimeout(timeoutObj);
            this.ipcEmitter.removeListener(requestId, messageHandler);
            emitter.emit("complete", data);
          } else if (data && data.type === CommunicationMessageTypeEnum.ERROR) {
            clearTimeout(timeoutObj);
            this.ipcEmitter.removeListener(requestId, messageHandler);
            emitter.emit("error", data);
          }
        };

        this.ipcEmitter.on(requestId, messageHandler);
        resetTimeout();
        resolve(emitter);
      }
    });
  }

  /*
    * @param topic: CommunicationMessageTopicEnum
    * @param isStream: boolean
    * @param payload: any
    * @param timeout: number
    * @return Promise<any> | EventEmitter
    * @description
    *  Send message to background and wait for response
    * Example:
      try {
        const data = await ipcClient.request(
          CommunicationMessageTopicEnum.CONVERSATION,
          false,
          {
            message: "who are you?",
          },
          10000
        );
        console.log(data);
      } catch (error) {
        console.log(error);
      }

      const data = await ipcClient.request(
        CommunicationMessageTopicEnum.CONVERSATION,
        true,
        {
          message: "who are you?",
        },
        10000
      );
      data.on("data", (data) => {
        console.log(data.message);
      });
      data.on("error", (error) => {
        console.log(error);
      });
  */

  public request(
    topic: CommunicationMessageTopicEnum,
    isStream: boolean,
    payload: any = {},
    timeout: number = this.timeout
  ): Promise<any | EventEmitter> {
    return new Promise(async (resolve, reject) => {
      if (!isStream) {
        if (!this.port) {
          reject(
            new IPCClientException(
              status.IPC_CONNECTION_NOT_INITIALIZED,
              "IPC connection not initialized"
            )
          );
        }

        const requestId = uuid();
        const data: CommunicationMessageType = {
          topic: topic,
          type: CommunicationMessageTypeEnum.MESSAGE,
          requestId: requestId,
          payload: payload,
        };
        this.sendMessage(data);

        try {
          const resData = await this.response(
            isStream,
            topic,
            timeout,
            requestId
          );
          resolve(resData.payload);
        } catch (err) {
          reject(err);
        }
      } else {
        const emitter = new EventEmitter();
        if (!this.port) {
          const error = new IPCClientException(
            status.IPC_CONNECTION_NOT_INITIALIZED,
            "IPC connection not initialized"
          );
          emitter.emit("error", error);
          return resolve(emitter);
        }

        const requestId = uuid();
        const data: CommunicationMessageType = {
          topic: topic,
          type: CommunicationMessageTypeEnum.STREAM,
          requestId: requestId,
          payload: payload,
        };
        this.sendMessage(data);
        const resData = await this.response(true, topic, timeout, requestId);

        resData.on("data", (data: CommunicationMessageType) => {
          emitter.emit("data", data.payload);
        });

        resData.on("complete", (data: CommunicationMessageType) => {
          emitter.emit("complete", data.payload);
        });

        resData.on("error", (data: CommunicationMessageType) => {
          emitter.emit("error", data);
        });

        resolve(emitter);
      }
    });
  }
}

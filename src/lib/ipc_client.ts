import { CWException } from "../types/exception";
import { status } from "../constants/status";
import { EventEmitter } from "../utils/event_emitter";
import { uuid, sleep } from "../utils";
import {
  CommunicationMessageTopicEnum,
  CommunicationMessageType,
  CommunicationMessageTypeEnum,
} from "../types";

export class IPCClientException extends CWException {}

export class IPCClient {
  private static instance: IPCClient;
  private NAME = "IPC";
  private port: chrome.runtime.Port | null = null;
  public timeout: number = 10000;
  private ipcEmitter = new EventEmitter();

  private constructor() {}

  public static getInstance(): IPCClient {
    if (!IPCClient.instance) {
      IPCClient.instance = new IPCClient();
    }
    return IPCClient.instance;
  }

  private connect() {
    this.port = chrome.runtime.connect({ name: this.NAME });
    this.port.onMessage.addListener((data: CommunicationMessageType) => {
      this.ipcEmitter.emit(data.requestId, data);
    });
  }

  public initConnection(): IPCClient {
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

  private response(
    type: CommunicationMessageTypeEnum,
    topic: CommunicationMessageTopicEnum,
    timeout: number,
    requestId: string
  ): Promise<CommunicationMessageType> | EventEmitter {
    if (type === CommunicationMessageTypeEnum.STREAM) {
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

      return emitter;
    } else if (type === CommunicationMessageTypeEnum.MESSAGE) {
      return new Promise(async (resolve, reject) => {
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
      });
    } else {
      throw new IPCClientException(
        status.IPC_INVALID_MESSAGE_TYPE,
        "Invalid message type"
      );
    }
  }

  public request(
    topic: CommunicationMessageTopicEnum,
    isStream: boolean,
    payload: any = {},
    timeout: number = this.timeout
  ): Promise<any> | EventEmitter {
    if (!isStream) {
      return new Promise(async (resolve, reject) => {
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
          const resData = (await this.response(
            CommunicationMessageTypeEnum.MESSAGE,
            topic,
            timeout,
            requestId
          )) as CommunicationMessageType;
          resolve(resData.payload);
        } catch (err) {
          reject(err);
        }
      });
    } else {
      const emitter = new EventEmitter();
      if (!this.port) {
        const error = new IPCClientException(
          status.IPC_CONNECTION_NOT_INITIALIZED,
          "IPC connection not initialized"
        );
        emitter.emit("error", error);
        return emitter;
      }

      const requestId = uuid();
      const data: CommunicationMessageType = {
        topic: topic,
        type: CommunicationMessageTypeEnum.STREAM,
        requestId: requestId,
        payload: payload,
      };
      this.sendMessage(data);
      const resData = this.response(
        CommunicationMessageTypeEnum.STREAM,
        topic,
        timeout,
        requestId
      ) as EventEmitter;

      resData.on("data", (data: CommunicationMessageType) => {
        emitter.emit("data", data.payload);
      });

      resData.on("complete", (data: CommunicationMessageType) => {
        emitter.emit("data", data.payload);
      });

      resData.on("error", (data: CommunicationMessageType) => {
        emitter.emit("error", data);
      });

      return emitter;
    }
  }
}

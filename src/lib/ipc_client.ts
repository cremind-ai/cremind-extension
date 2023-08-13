import { CWException } from '@/types/exception'
import { Status } from '@/constants/status'
import { EventEmitter } from '@/utils/event_emitter'
import { uuid } from '@/utils'
import { IPCTopicEnum, IPCMessageType, ConversationMessageTypeEnum } from '@/types'
import { CONTENT_SCRIPT_PORT_NAME } from '@/constants'
import { consoleLog, LogLevelEnum } from '@/utils'

export class IPCClientException extends CWException {}

export class IPCClient {
  private static instance: IPCClient
  private NAME = CONTENT_SCRIPT_PORT_NAME
  private port: chrome.runtime.Port | null = null
  public timeout: number = 30000
  private ipcEmitter = new EventEmitter()

  private constructor() {}

  public static getInstance(): IPCClient {
    if (!IPCClient.instance) {
      IPCClient.instance = new IPCClient()
      IPCClient.instance.initConnection()
    }
    return IPCClient.instance
  }

  private connect() {
    this.port = chrome.runtime.connect({ name: this.NAME })
    this.port.onMessage.addListener((data: IPCMessageType) => {
      this.ipcEmitter.emit(data.requestId!, data)
    })
  }

  private initConnection(): IPCClient {
    this.connect()
    this.port!.onDisconnect.addListener(() => {
      this.connect()
    })

    return this
  }

  public async sendMessage(data: any) {
    try {
      this.port!.postMessage(data)
    } catch (err) {
      this.port = chrome.runtime.connect({ name: this.NAME })
      this.connect()
      this.port.postMessage(data)
    }
  }

  public async response(
    isStream: boolean,
    topic: IPCTopicEnum,
    timeout: number,
    requestId: string,
  ): Promise<any | EventEmitter> {
    return new Promise(async (resolve, reject) => {
      if (!isStream) {
        const timeoutObj = setTimeout(() => {
          this.ipcEmitter.emit(requestId, {
            topic: topic,
            type: ConversationMessageTypeEnum.ERROR,
            code: Status.IPC_RESPONSE_TIMEOUT,
            message: 'IPC response timeout',
            requestId: requestId,
          })
          reject(new IPCClientException(Status.IPC_RESPONSE_TIMEOUT, 'IPC response timeout'))
        }, timeout)
        this.ipcEmitter.once(requestId, (data: IPCMessageType) => {
          if (data && data.code !== Status.IPC_RESPONSE_TIMEOUT) {
            resolve(data)
            clearTimeout(timeoutObj)
          }
        })
      } else {
        const emitter = new EventEmitter()
        resolve(emitter)
        let timeoutObj: NodeJS.Timeout

        const resetTimeout = () => {
          clearTimeout(timeoutObj)
          timeoutObj = setTimeout(() => {
            this.ipcEmitter.emit(requestId, {
              topic: topic,
              type: ConversationMessageTypeEnum.ERROR,
              code: Status.IPC_RESPONSE_TIMEOUT,
              message: 'IPC response timeout',
              requestId: requestId,
            })
            this.ipcEmitter.removeListener(requestId, messageHandler)
          }, timeout)
        }

        const messageHandler = (data: IPCMessageType) => {
          if (data && data.type === ConversationMessageTypeEnum.STREAM) {
            resetTimeout()
            emitter.emit('data', data)
          } else if (data && data.type === ConversationMessageTypeEnum.COMPLETE) {
            clearTimeout(timeoutObj)
            this.ipcEmitter.removeListener(requestId, messageHandler)
            emitter.emit('complete', data)
          } else if (data && data.type === ConversationMessageTypeEnum.ERROR) {
            clearTimeout(timeoutObj)
            this.ipcEmitter.removeListener(requestId, messageHandler)
            if (data.payload) {
              emitter.emit('error', new IPCClientException(data.payload.code, data.payload.message))
            } else {
              emitter.emit('error', new IPCClientException(data.code!, data.message!))
            }
          }
        }

        this.ipcEmitter.on(requestId, messageHandler)
        resetTimeout()
      }
    })
  }

  /*
    * @param topic: IPCTopicEnum
    * @param isStream: boolean
    * @param payload: any
    * @param timeout: number
    * @return Promise<any> | EventEmitter
    * @description
    *  Send message to background and wait for response
    * Example:
      try {
        const data = await ipcClient.request(
          IPCTopicEnum.CONVERSATION,
          false,
          {
            message: "who are you?",
          },
          10000
        );
        consoleLog(LogLevelEnum.DEBUG, data);
      } catch (error) {
        consoleLog(LogLevelEnum.DEBUG, error);
      }

      const data = await ipcClient.request(
        IPCTopicEnum.CONVERSATION,
        true,
        {
          message: "who are you?",
        },
        10000
      );
      data.on("data", (data) => {
        consoleLog(LogLevelEnum.DEBUG, data.message);
      });
      data.on("error", (error) => {
        consoleLog(LogLevelEnum.DEBUG, error);
      });
  */

  public request(
    topic: IPCTopicEnum,
    isStream: boolean,
    payload: any = {},
    timeout: number = this.timeout,
  ): Promise<any | EventEmitter> {
    return new Promise(async (resolve, reject) => {
      if (!isStream) {
        if (!this.port) {
          reject(
            new IPCClientException(
              Status.IPC_CONNECTION_NOT_INITIALIZED,
              'IPC connection not initialized',
            ),
          )
        }

        const requestId = uuid()
        const data: IPCMessageType = {
          topic: topic,
          type: ConversationMessageTypeEnum.MESSAGE,
          requestId: requestId,
          payload: payload,
        }
        this.sendMessage(data)

        try {
          const resData = await this.response(isStream, topic, timeout, requestId)
          resolve(resData.payload)
        } catch (err: any) {
          reject(err)
        }
      } else {
        const emitter = new EventEmitter()
        if (!this.port) {
          const error = new IPCClientException(
            Status.IPC_CONNECTION_NOT_INITIALIZED,
            'IPC connection not initialized',
          )
          emitter.emit('error', error)
          return resolve(emitter)
        }
        resolve(emitter)

        const requestId = uuid()
        const data: IPCMessageType = {
          topic: topic,
          type: ConversationMessageTypeEnum.STREAM,
          requestId: requestId,
          payload: payload,
        }
        this.sendMessage(data)
        const resData = await this.response(true, topic, timeout, requestId)

        resData.on('data', (data: IPCMessageType) => {
          emitter.emit('data', data.payload)
        })

        resData.on('complete', (data: IPCMessageType) => {
          emitter.emit('complete', data.payload)
        })

        resData.on('error', (data: CWException) => {
          emitter.emit('error', data)
        })
      }
    })
  }
}

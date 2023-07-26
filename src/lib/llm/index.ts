import { CWException } from "../../types/exception";
import { IPCClient } from "../../lib/ipc_client";
import { EventEmitter } from "../../utils/event_emitter";
import { IPCTopicEnum, LLMMODE } from "../../types";

export class LLMException extends CWException {}

export class LLM {
  private ipcClient: IPCClient;
  constructor() {
    this.ipcClient = IPCClient.getInstance();
  }

  public async deleteConversation(args: any) {
    this.ipcClient.request(
      IPCTopicEnum.CONVERSATION,
      false,
      {
        ...args,
        mode: LLMMODE.DELETE_CONVERSATION,
      },
      10000
    );
  }

  public async stopGenerating(): Promise<any> {
    const resData = await this.ipcClient.request(
      IPCTopicEnum.CONVERSATION,
      false,
      {
        mode: LLMMODE.STOP_GENERATING,
      },
      10000
    );
    return resData;
  }

  public request(
    prompt: string,
    isStream: boolean,
    args: any
  ): Promise<EventEmitter> {
    return new Promise(async (resolve, reject) => {
      const emitter = new EventEmitter();
      resolve(emitter);

      try {
        const data = await this.ipcClient.request(
          IPCTopicEnum.CONVERSATION,
          isStream,
          {
            ...args,
            mode: LLMMODE.COMMUNICATION,
            message: prompt,
          },
          60000
        );
        data.on("data", (data) => {
          emitter.emit("data", data);
        });
        data.on("complete", (data) => {
          emitter.emit("complete", data);
        });
        data.on("error", (err) => {
          emitter.emit("error", err);
        });
      } catch (err) {
        emitter.emit("error", err);
      }
    });
  }
}

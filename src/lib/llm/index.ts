import { CWException } from "@/types/exception";
import { IPCClient } from "@/lib/ipc_client";
import { EventEmitter } from "@/utils/event_emitter";
import { IPCTopicEnum, LLMMODE } from "@/types";
import { AIPayloadType } from "@/types/provider";
import { getArkoseToken } from "@/utils/arkose";
import { ChromeStorage } from "@/hooks/chrome_storage";

export class LLMException extends CWException {}

export class LLM {
  private ipcClient: IPCClient;
  constructor() {
    this.ipcClient = IPCClient.getInstance();
  }

  public async deleteConversation(args: AIPayloadType) {
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

  public async authentication(args: AIPayloadType): Promise<any> {
    const resData = await this.ipcClient.request(
      IPCTopicEnum.CONVERSATION,
      false,
      {
        ...args,
        mode: LLMMODE.AUTHENTICATION,
      },
      10000
    );
    return resData;
  }

  public request(
    prompt: string,
    isStream: boolean,
    args: AIPayloadType
  ): Promise<EventEmitter> {
    return new Promise(async (resolve, reject) => {
      const emitter = new EventEmitter();
      resolve(emitter);

      try {
        const expirationTimeInMinutes = 60;
        const currentTime = new Date().getTime();
        const arkoseTokenJSON = await ChromeStorage.getInstance().get(
          "ARKOSE_TOKEN"
        );

        let arkoseTokenObject = { data: "", expireTime: 0 };
        if (arkoseTokenJSON) {
          arkoseTokenObject = JSON.parse(arkoseTokenJSON);
        }
        if (currentTime > arkoseTokenObject.expireTime) {
          const arkoseToken = await getArkoseToken();
          arkoseTokenObject.data = arkoseToken!;
          arkoseTokenObject.expireTime =
            currentTime + expirationTimeInMinutes * 60 * 1000;
          ChromeStorage.getInstance().set(
            "ARKOSE_TOKEN",
            JSON.stringify(arkoseTokenObject)
          );
        }

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
        data.on("data", (data: any) => {
          emitter.emit("data", data);
        });
        data.on("complete", (data: any) => {
          emitter.emit("complete", data);
        });
        data.on("error", (err: any) => {
          emitter.emit("error", err);
        });
      } catch (err) {
        emitter.emit("error", err);
      }
    });
  }
}

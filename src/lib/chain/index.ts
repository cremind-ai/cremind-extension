import { resolve } from "path";
import { IPCClient } from "../../lib/ipc_client";
import { EventEmitter } from "../../utils/event_emitter";
import { PromptTemplate } from "../prompt_template";
import { CommunicationMessageTopicEnum } from "../../types";

export class Chain {
  private promptTemplate: PromptTemplate;
  private variables: { [key: string]: string };
  private ipcClient: IPCClient;

  constructor(
    promptTemplate: PromptTemplate,
    variables: { [key: string]: string }
  ) {
    this.promptTemplate = promptTemplate;
    this.variables = variables;
    this.ipcClient = IPCClient.getInstance();
  }

  public async execute(isStream: boolean): Promise<string | EventEmitter> {
    return new Promise(async (resolve, reject) => {
      if (!isStream) {
        resolve("hello");
      } else {
        const emitter = new EventEmitter();
        try {
          const prompt = this.promptTemplate.render(this.variables);
          console.log(prompt);
          const data = await this.ipcClient.request(
            CommunicationMessageTopicEnum.CONVERSATION,
            true,
            {
              message: prompt,
            },
            20000
          );
          data.on("data", (data) => {
            emitter.emit("data", data.message);
          });
          data.on("complete", (data) => {
            emitter.emit("complete", data.message);
          });
          data.on("error", (error) => {
            console.log(error);
          });
        } catch (err) {
          reject(err);
        }
        resolve(emitter);
      }
    });
  }
}

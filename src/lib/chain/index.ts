import { resolve } from "path";
import { CWException } from "../../types/exception";
import { IPCClient } from "../../lib/ipc_client";
import { EventEmitter } from "../../utils/event_emitter";
import { PromptTemplate } from "../prompt_template";
import { CommunicationMessageTopicEnum } from "../../types";
import { status } from "../../constants/status";

export class ChainException extends CWException {}
export class Chain {
  private promptTemplate: PromptTemplate;
  private variables: { [key: string]: string };
  private ipcClient: IPCClient;
  private previousChain: Chain | null;

  public variableOutput: string | null = null;
  public output: string = "";

  constructor(
    promptTemplate: PromptTemplate,
    variables: { [key: string]: string },
    variableOutput: string | null = null,
    previousChain: Chain | null = null
  ) {
    this.ipcClient = IPCClient.getInstance();
    this.promptTemplate = promptTemplate;
    this.variables = variables;
    this.variableOutput = variableOutput;
    this.previousChain = previousChain;
  }

  public async execute(streamOutput: boolean): Promise<EventEmitter> {
    return new Promise(async (resolve, reject) => {
      const emitter = new EventEmitter();
      resolve(emitter);
      if (!streamOutput) {
        if (this.previousChain) {
          const resultPreviousChain = await this.previousChain.execute(false);

          const ChainPromise = new Promise((resolve, reject) => {
            resultPreviousChain.on("complete", (data: string) => {
              resolve(data);
            });
            resultPreviousChain.on("error", (error: CWException) => {
              reject(error);
            });
          });
          let data;
          try {
            data = await ChainPromise;
          } catch (err) {
            emitter.emit("error", err);
            return;
          }
          this.variables[this.previousChain.variableOutput!] = data;
        }

        const prompt = this.promptTemplate.render(this.variables);
        try {
          const data = await this.ipcClient.request(
            CommunicationMessageTopicEnum.CONVERSATION,
            false,
            {
              message: prompt,
            },
            5 * 60000
          );
          emitter.emit("complete", data.message);
        } catch (err) {
          emitter.emit("error", err);
        }
      } else {
        if (this.previousChain) {
          const resultPreviousChain = await this.previousChain.execute(true);

          const ChainPromise = new Promise((resolve, reject) => {
            resultPreviousChain.on("data", (data: string) => {
              emitter.emit("data", data);
            });
            resultPreviousChain.on("complete", (data: string) => {
              resolve(data);
            });
            resultPreviousChain.on("error", (error: CWException) => {
              reject(error);
            });
          });
          let data;
          try {
            data = await ChainPromise;
            emitter.emit("complete", data);
          } catch (err) {
            emitter.emit("error", err);
            return;
          }
          this.variables[this.previousChain.variableOutput!] = data;
        }
        try {
          const prompt = this.promptTemplate.render(this.variables);
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
            this.output = data.message;
            emitter.emit("complete", data.message);
          });
          data.on("error", (err) => {
            emitter.emit("error", err);
          });
        } catch (err) {
          emitter.emit("error", err);
        }
      }
    });
  }
}

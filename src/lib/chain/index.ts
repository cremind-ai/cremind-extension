import { CWException } from "../../types/exception";
import { IPCClient } from "../../lib/ipc_client";
import { EventEmitter } from "../../utils/event_emitter";
import { PromptTemplate } from "../prompt_template";
import { CommunicationMessageTopicEnum } from "../../types";

export class ChainException extends CWException {}

/*
  Example:
  const variableSchemes: ChainVariableSchema = {
    sentence_input: {
      options: ["Hello", "Hi"],
      description: "Input sentence",
      storage: true,
    },
  };
*/
export type ChainVariableSchema = {
  [key: string]: {
    options?: Array<string | number>;
    description: string;
    storage: boolean;
  };
};

export class Chain {
  private promptTemplate: PromptTemplate;
  private variables: { [key: string]: string } | null = null;
  private ipcClient: IPCClient;
  private previousChain: Chain | null;
  private streamOutput: boolean = true;

  public variableOutput: string | null = null;
  public output: string = "";
  public name: string;

  constructor(
    name: string | null = null,
    promptTemplate: PromptTemplate,
    variables: { [key: string]: string } | null = null,
    variableOutput: string | null = null,
    previousChain: Chain | null = null,
    streamOutput: boolean = true
  ) {
    this.name = name!;
    this.ipcClient = IPCClient.getInstance();
    this.promptTemplate = promptTemplate;
    this.variables = variables;
    this.variableOutput = variableOutput;
    this.previousChain = previousChain;
    this.streamOutput = streamOutput;
  }

  public async execute(): Promise<EventEmitter> {
    return new Promise(async (resolve, reject) => {
      const emitter = new EventEmitter();
      resolve(emitter);

      try {
        let prompt;
        if (this.previousChain) {
          const resultPreviousChain = await this.previousChain.execute();
          const ChainPromise = new Promise<string>((resolve, reject) => {
            resultPreviousChain.on("data", (data: string) => {
              emitter.emit("data", data);
            });
            resultPreviousChain.on("endOfChain", (data: string) => {
              resolve(data);
            });
            resultPreviousChain.on("complete", (data: string) => {
              emitter.emit("complete", data);
            });
            resultPreviousChain.on("error", (error: CWException) => {
              reject(error);
            });
          });

          const data = await ChainPromise;
          emitter.emit("complete", data);

          if (!this.variables) {
            this.variables = {};
          }
          this.variables[this.previousChain.variableOutput!] = data;

          prompt = this.promptTemplate.render(this.variables);
        } else {
          prompt = this.promptTemplate.render(this.variables);
        }

        console.log("=====================");
        console.log(prompt);
        console.log("=====================");
        const data = await this.ipcClient.request(
          CommunicationMessageTopicEnum.CONVERSATION,
          true,
          {
            message: prompt,
          },
          20000
        );
        data.on("data", (data) => {
          if (this.streamOutput) {
            emitter.emit("data", data.message);
          }
        });
        data.on("complete", (data) => {
          this.output = data.message;
          emitter.emit("endOfChain", data.message);
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

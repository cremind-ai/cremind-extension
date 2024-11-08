import { CMException } from "@/types/exception";
import { IPCClient } from "@/lib/ipc_client";
import { EventEmitter } from "@/utils/event_emitter";
import { PromptTemplate } from "../prompt_template";
import { IPCTopicEnum } from "@/types";
import { LLM } from "../llm";
import { ConversationModeEnum } from "@/types/conversation";
import { AIPayloadType } from "@/types/provider";

export class ChainException extends CMException {}

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
export type VariableSchema = {
  options?: Array<string | number>;
  systemOptions?: string;
  description: string;
  storage: boolean;
  sample: string | number;
  default: string | number;
  value: string | null;
  customOptions: string[];
};

export type ChainVariableSchema = {
  [key: string]: VariableSchema;
};

export class Chain {
  private promptTemplate: PromptTemplate;
  private llm: LLM;
  private variables: { [key: string]: string } | null = null;
  private previousChain: Chain | null;
  private streamOutput: boolean = true;

  public variableOutput: string | null = null;
  public output: string = "";
  public name: string;

  constructor(
    name: string | null = null,
    llm: LLM,
    promptTemplate: PromptTemplate,
    variables: { [key: string]: string } | null = null,
    variableOutput: string | null = null,
    previousChain: Chain | null = null,
    streamOutput: boolean = true
  ) {
    this.name = name!;
    this.llm = llm;
    this.promptTemplate = promptTemplate;
    this.variables = variables;
    this.variableOutput = variableOutput;
    this.previousChain = previousChain;
    this.streamOutput = streamOutput;
  }

  public async execute(
    isStream: boolean,
    args: AIPayloadType
  ): Promise<EventEmitter> {
    return new Promise(async (resolve, reject) => {
      const emitter = new EventEmitter();
      resolve(emitter);

      try {
        let prompt: string = "";
        if (this.previousChain) {
          const resultPreviousChain = await this.previousChain.execute(
            isStream,
            args
          );
          const ChainPromise = new Promise<any>((resolve, reject) => {
            resultPreviousChain.on("prompt", (data: any) => {
              emitter.emit("prompt", data);
            });
            resultPreviousChain.on("data", (data: any) => {
              emitter.emit("data", data);
            });
            resultPreviousChain.on("endOfChain", (data: any) => {
              resolve(data);
            });
            resultPreviousChain.on("complete", (data: any) => {
              emitter.emit("complete", data);
            });
            resultPreviousChain.on("error", (error: CMException) => {
              reject(error);
            });
          });

          const data = await ChainPromise;
          emitter.emit("complete", data);

          if (!this.variables) {
            this.variables = {};
          }
          this.variables[this.previousChain.variableOutput!] = data.message;

          prompt = this.promptTemplate.render(this.variables);
        } else {
          prompt = this.promptTemplate.render(this.variables);
        }

        console.log("=====================");
        if (args.conversationMode === ConversationModeEnum.CONTINUE) {
          prompt = "Continue";
        }
        console.log(prompt);
        console.log("=====================");
        setTimeout(() => {
          emitter.emit("prompt", prompt);
        }, 0);

        const data = await this.llm.request(prompt, isStream, args);
        data.on("data", (data) => {
          if (this.streamOutput) {
            emitter.emit("data", data.message);
          }
        });
        data.on("complete", (data) => {
          this.output = data.message;
          emitter.emit("endOfChain", data);
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

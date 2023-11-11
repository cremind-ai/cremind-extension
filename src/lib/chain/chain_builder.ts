import { Chain } from ".";
import { PromptTemplate } from "../prompt_template";
import { CMException } from "@/types/exception";
import { SystemVariableParser } from "../system_variable_parser";
import { EventEmitter } from "@/utils/event_emitter";
import { LLM } from "../llm";
import { AIPayloadType } from "@/types/provider";

export type ChainConfig = {
  name: string;
  promptTemplate: string;
  variableOutput: string | null;
};

export class ChainBuilder {
  private chains: Chain[] = [];
  private configs: ChainConfig[] = [];
  public llm: LLM;

  constructor(llm: LLM, configs: ChainConfig[]) {
    this.configs = configs;
    this.llm = llm;
  }

  public async buildChains(variables: { [key: string]: string }) {
    let previousChain: Chain | null = null;
    for (const config of this.configs) {
      const _variables: { [key: string]: string } = {};
      const prompt = await SystemVariableParser.getInstance().parse(
        config.promptTemplate
      );
      const promptTemplate = new PromptTemplate(prompt);
      promptTemplate.getVariables().forEach((variable) => {
        if (variables[variable]) {
          _variables[variable] = variables[variable];
        }
      });

      const chain: Chain = new Chain(
        config.name,
        this.llm,
        promptTemplate,
        _variables,
        config.variableOutput,
        previousChain,
        true
      );

      this.chains.push(chain);
      previousChain = chain;
    }
  }

  public async executeChains(
    isStream: boolean,
    args: AIPayloadType
  ): Promise<EventEmitter> {
    return new Promise(async (resolve, reject) => {
      const emitter = new EventEmitter();
      resolve(emitter);
      if (this.chains.length > 0) {
        const result = await this.chains[this.chains.length - 1].execute(
          isStream,
          args
        );

        result.on("prompt", (data: any) => {
          emitter.emit("prompt", data);
        });

        result.on("data", (data: any) => {
          emitter.emit("data", data);
        });

        result.on("complete", (data: any) => {
          emitter.emit("complete", data);
        });

        result.on("endOfChain", (data: any) => {
          emitter.emit("endOfChain", data);
        });

        result.on("error", (err: CMException) => {
          emitter.emit("error", err);
        });
      }
    });
  }
}

import { Chain } from ".";
import { PromptTemplate } from "../prompt_template";
import { CWException } from "../../types/exception";
import { SystemVariableParser } from "../system_variable_parser";
import { EventEmitter } from "../../utils/event_emitter";
import { LLM } from "../llm";

export type ChainConfig = {
  name: string;
  promptTemplate: string;
  variableOutput: string | null;
};

export class ChainBuilder {
  private chains: Chain[] = [];
  private configs: ChainConfig[] = [];

  constructor(configs: ChainConfig[]) {
    this.configs = configs;
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

      const llm = new LLM();
      const chain = new Chain(
        config.name,
        llm,
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

  public async executeChains(): Promise<EventEmitter> {
    return new Promise(async (resolve, reject) => {
      const emitter = new EventEmitter();
      resolve(emitter);
      if (this.chains.length > 0) {
        const result = await this.chains[this.chains.length - 1].execute(true, {
          conversationId: null,
          deleteConversation: true,
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

        result.on("error", (err: CWException) => {
          emitter.emit("error", err);
        });
      }
    });
  }
}

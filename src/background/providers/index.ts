import { AIProvider } from "./base";
import { OpenAIAPI } from "./openai";
import { ChatGPT } from "./chatgpt";
import { CWException } from "../../types/exception";

export class AIProviderException extends CWException {}

export class AIProviderFactory {
  static createChatGPT(): AIProvider {
    return ChatGPT.getInstance().initCache();
  }

  static createOpenAI(apiKey: string): AIProvider {
    return new OpenAIAPI(apiKey);
  }
}

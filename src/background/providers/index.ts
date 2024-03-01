import { AIProvider } from "./base";
import { OpenAIAPI } from "./openai";
import { ChatGPT } from "./chatgpt";
import { Claude } from "./claude";
import { Gemini } from "./gemini";
import { CMException } from "@/types/exception";

export class AIProviderException extends CMException {}

export class AIProviderFactory {
  static createChatGPT(): AIProvider {
    return ChatGPT.getInstance().initCache();
  }

  static createClaude(): AIProvider {
    return new Claude();
  }

  static createOpenAI(apiKey: string): AIProvider {
    return new OpenAIAPI(apiKey);
  }

  static createBard(): AIProvider {
    return new Gemini();
  }
}

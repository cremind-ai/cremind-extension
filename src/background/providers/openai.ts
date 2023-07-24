import { AIResponseType, AIResponseTypeEnum } from "../../types/provider";
import { AIProvider } from "./base";

export class OpenAIAPI extends AIProvider {
  public isProcessing: boolean = false;
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  public closeStream = () => {};
  public deleteConversation(conversationId: string): void {}

  async conversation(
    conversationId: string | null,
    messageId: string | null,
    prompt: string,
    isStream: boolean,
    args: any
  ): Promise<(callback: (data: AIResponseType) => void) => void> {
    return new Promise<(callback: (data: AIResponseType) => void) => void>(
      (resolve, reject) => {
        resolve(async (callback: (data: AIResponseType) => void) => {
          console.log(prompt);

          callback({
            type: AIResponseTypeEnum.MESSAGE,
            message: "Hello OpenAIAPI",
          });

          callback({
            type: AIResponseTypeEnum.COMPLETE,
            message: "Final message OpenAIAPI",
          });
        });
      }
    );
  }
}

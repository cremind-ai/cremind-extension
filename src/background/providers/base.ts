import type { AIResponseType } from "../../types/provider";

// export interface AIProvider {
//   isProcessing: boolean;
//   closeStream: () => void;
//   conversation(
//     prompt: string,
//     isStream: boolean
//   ): Promise<(callback: (data: AIResponseType) => void) => void>;
// }

export abstract class AIProvider {
  isProcessing: boolean = false;
  abstract closeStream(): void;
  abstract deleteConversation(conversationId: string): void;
  abstract conversation(
    conversationId: string | null,
    messageId: string | null,
    prompt: string,
    isStream: boolean,
    args: any
  ): Promise<(callback: (data: AIResponseType) => void) => void>;
}

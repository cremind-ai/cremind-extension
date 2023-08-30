import type { AIResponseType } from "@/types/provider";

export abstract class AIProvider {
  isProcessing: boolean = false;
  conversationId: string | null = null;
  abstract closeStream(): void;
  abstract deleteConversation(conversationId: string): void;
  abstract authentication(): Promise<void>;
  abstract conversation(
    conversationId: string | null,
    messageId: string | null,
    prompt: string,
    isStream: boolean,
    args: any
  ): Promise<(callback: (data: AIResponseType) => void) => void>;
}

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
  abstract conversation(
    prompt: string,
    isStream: boolean
  ): Promise<(callback: (data: AIResponseType) => void) => void>;
}

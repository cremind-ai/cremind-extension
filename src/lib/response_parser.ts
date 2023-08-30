import { SystemVariable } from "@/constants/system_variables";
import { ChromeStorage } from "@/hooks/chrome_storage";

export class ResponseParser {
  private static instance: ResponseParser;

  private constructor() {}

  public static getInstance(): ResponseParser {
    if (!ResponseParser.instance) {
      ResponseParser.instance = new ResponseParser();
    }
    return ResponseParser.instance;
  }

  public extractTextFromBlock(
    startTag: string,
    endTag: string,
    text: string
  ): string | null {
    const startIndex = text.indexOf(startTag);
    const endIndex = text.indexOf(endTag);

    if (startIndex !== -1 && endIndex !== -1) {
      const outputText = text
        .substring(startIndex + startTag.length, endIndex)
        .trim();
      return outputText;
    } else {
      return null;
    }
  }
}

import { SystemVariable } from "@/constants/system_variables";
import { ChromeStorage } from "@/hooks/chrome_storage";

export class SystemVariableParser {
  private static instance: SystemVariableParser;
  private selectedText: string | null = null;
  private uploadedText: string | null = null;

  private constructor() {}

  public static getInstance(): SystemVariableParser {
    if (!SystemVariableParser.instance) {
      SystemVariableParser.instance = new SystemVariableParser();
    }
    return SystemVariableParser.instance;
  }

  public setSelectedText(text: string): SystemVariableParser {
    this.selectedText = text;
    return this;
  }

  public getSelectedText(): string {
    return this.selectedText!;
  }

  public setUploadedText(text: string): SystemVariableParser {
    this.uploadedText = text;
    return this;
  }

  public getUploadedText(): string {
    return this.uploadedText!;
  }

  private async getLanguage(): Promise<string> {
    const value = await ChromeStorage.getInstance().get(
      `SYS:${SystemVariable.LANGUAGE}`
    );
    if (value) {
      return value;
    } else {
      ChromeStorage.getInstance().set(
        `SYS:${SystemVariable.LANGUAGE}`,
        "English"
      );
      return "English";
    }
  }

  public async parse(text: string): Promise<string> {
    if (this.selectedText) {
      text = text.replace(
        new RegExp(`&{${SystemVariable.SELECTED_TEXT}}`, "g"),
        this.selectedText
      );
    }
    if (this.uploadedText) {
      text = text.replace(
        new RegExp(`&{${SystemVariable.UPLOADED_TEXT}}`, "g"),
        this.uploadedText
      );
    }
    text = text.replace(
      new RegExp(`&{${SystemVariable.DATETIME}}`, "g"),
      new Date().toISOString()
    );
    text = text.replace(
      new RegExp(`&{${SystemVariable.LANGUAGE}}`, "g"),
      await this.getLanguage()
    );
    return text;
  }
}

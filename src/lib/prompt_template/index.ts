import { CWException } from "../../types/exception";
import { status } from "../../constants/status";

export class PromptTemplateException extends CWException {}

export class PromptTemplate {
  input: string;
  constructor(input: string) {
    this.input = input;
  }

  public getVariables(): string[] {
    const regex = /\@{([a-zA-Z0-9_]+)}/g;
    const matches = this.input.match(regex);
    if (matches) {
      return matches.map((match) => match.replace("@{", "").replace("}", ""));
    }
    return [];
  }

  public validateVariables(variables: { [key: string]: string }): boolean {
    const templateVariables = this.getVariables();
    const missingVariables = templateVariables.filter(
      (variable) => !variables[variable]
    );
    return missingVariables.length === 0;
  }

  public render(variables: { [key: string]: string }): string {
    let output = this.input;
    if (!this.validateVariables(variables)) {
      throw new PromptTemplateException(
        status.PROMPT_TEMPLATE_MISSING_VARIABLES,
        "Prompt missing variables"
      );
    }
    const templateVariables = this.getVariables();
    templateVariables.forEach((variable) => {
      output = output.replace(`@{${variable}}`, variables[variable]);
    });
    return output;
  }
}

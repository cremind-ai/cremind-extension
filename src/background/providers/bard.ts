import { AIResponseType, AIResponseTypeEnum } from "@/types/provider";
import { AIProvider } from "./base";
import { consoleLog, LogLevelEnum } from "@/utils";
import { AIProviderException } from "./index";
import { Status } from "@/constants/status";
import { ofetch } from "ofetch";
import { ConversationModeEnum } from "@/types/conversation";

export class Bard extends AIProvider {
  public isProcessing: boolean = false;
  private atValue: string | null;
  private blValue: string | null;

  constructor() {
    super();
    this.atValue = null;
    this.blValue = null;
  }

  public closeStream = () => {};
  public deleteConversation(conversationId: string): void {
    ofetch("https://bard.google.com/_/BardChatUi/data/batchexecute", {
      method: "POST",
      query: {
        bl: this.blValue,
        hl: "en",
        _reqid: this.generateReqId(),
        rt: "c",
      },
      body: new URLSearchParams({
        at: this.atValue!,
        "f.req": JSON.stringify([
          [["GzXR5e", `[${conversationId}]`, null, "generic"]],
        ]),
      }),
      parseResponse: (txt) => txt,
    });
  }

  public async getUserInfo(): Promise<void> {
    const requestParams = await this.fetchRequestParams();
    this.atValue = requestParams.atValue!;
    this.blValue = requestParams.blValue!;
    const resp = await ofetch(
      "https://bard.google.com/_/BardChatUi/data/batchexecute",
      {
        method: "POST",
        query: {
          bl: this.blValue,
          hl: "en",
          _reqid: this.generateReqId(),
          rt: "c",
        },
        body: new URLSearchParams({
          at: this.atValue!,
          "f.req": JSON.stringify([
            [
              [
                "o30O0e",
                '[["me"],[[["person.photo","person.name","person.email"]],null,[1,7],null,null,[]],null,null,[],null,[1,null,1]]',
                null,
                "generic",
              ],
            ],
          ]),
        }),
        parseResponse: (txt) => txt,
      }
    );
    const data = JSON.parse(resp.split("\n")[3]);
    const payload = JSON.parse(data[0][2]);
    if (!payload) {
      throw new AIProviderException(
        Status.BARD_UNAUTHORIZED,
        "Google Bard Unauthorized error. Please try again later."
      );
    }
  }

  private async parseBardResponse(resp: string) {
    const data = JSON.parse(resp.split("\n")[3]);
    const payload = JSON.parse(data[0][2]);
    if (!payload) {
      throw new AIProviderException(
        Status.BARD_BAD_REQUEST,
        "Google Bard unknow error. Please try again later."
      );
    }

    const text = payload[4][0][1][0] as string;
    return {
      text,
      ids: [...payload[1], payload[4][0][0]] as [string, string, string],
    };
  }

  private async generateReqId() {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  private extractFromHTML(variableName: string, html: string) {
    const regex = new RegExp(`"${variableName}":"([^"]+)"`);
    const match = regex.exec(html);
    return match?.[1];
  }

  private async fetchRequestParams() {
    const html = await ofetch("https://bard.google.com/faq", {
      cache: "reload",
    });
    const atValue = this.extractFromHTML("SNlM0e", html);
    const blValue = this.extractFromHTML("cfb2h", html);
    return { atValue, blValue };
  }

  public authentication = async () => {
    try {
      await this.getUserInfo();
    } catch (err) {
      if (err instanceof AIProviderException) {
        throw new AIProviderException(
          Status.BARD_UNAUTHORIZED,
          "Google Bard Unauthorized error. Please try again later."
        );
      }
    }
  };

  async conversation(
    conversationId: string | null,
    messageId: string | null,
    prompt: string,
    isStream: boolean,
    args: any
  ): Promise<(callback: (data: AIResponseType) => void) => void> {
    return new Promise<(callback: (data: AIResponseType) => void) => void>(
      (resolve, reject) => {
        if (this.isProcessing) {
          reject(new AIProviderException(Status.BARD_BUSY, "Bard Busy"));
          return;
        }
        this.isProcessing = true;
        resolve(async (callback: (data: AIResponseType) => void) => {
          let responseText = "";
          let contextIds = [];

          if (args.contextIds === undefined || args.contextIds.length === 0) {
            args.contextIds = [];
            contextIds = ["", "", ""];
          } else {
            contextIds = args.contextIds[args.contextIds.length - 1];
          }

          if (
            args.conversationMode === ConversationModeEnum.REGENERATE &&
            args.contextIds.length > 0
          ) {
            if (args.contextIds.length === 1) {
              this.deleteConversation(conversationId!);
              args.contextIds = [];
              contextIds = ["", "", ""];
            } else {
              args.contextIds.pop();
              contextIds = args.contextIds[args.contextIds.length - 1];
            }
          }

          try {
            const requestParams = await this.fetchRequestParams();
            this.atValue = requestParams.atValue!;
            this.blValue = requestParams.blValue!;
            const resp = await ofetch(
              "https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate",
              {
                method: "POST",
                query: {
                  bl: this.blValue,
                  _reqid: this.generateReqId(),
                  rt: "c",
                },
                body: new URLSearchParams({
                  at: this.atValue!,
                  "f.req": JSON.stringify([
                    null,
                    `[[${JSON.stringify(prompt)}],null,${JSON.stringify(
                      contextIds
                    )}]`,
                  ]),
                }),
                parseResponse: (txt) => txt,
              }
            );
            const { text, ids } = await this.parseBardResponse(resp);
            responseText = text;
            this.conversationId = ids[0];
            contextIds = ids;
          } catch (err) {
            if (err instanceof AIProviderException) {
              callback({
                type: AIResponseTypeEnum.ERROR,
                message: err.message,
                code: err.code,
              });
              this.isProcessing = false;
              return null;
            }
          }
          args.contextIds.push(contextIds);
          callback({
            type: AIResponseTypeEnum.COMPLETE,
            message: responseText,
            payload: {
              ...(!args.deleteConversation && {
                conversationId: this.conversationId!,
                contextIds: args.contextIds,
              }),
              endTurn: true,
            },
          });

          if (args.deleteConversation) {
            this.deleteConversation(this.conversationId!);
          }
          this.isProcessing = false;
        });
      }
    );
  }
}

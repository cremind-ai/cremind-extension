import { AIResponseType, AIResponseTypeEnum } from "@/types/provider";
import { AIProvider } from "./base";
import { consoleLog, LogLevelEnum, uuid } from "@/utils";
import { AIProviderException } from "./index";
import { Status } from "@/constants/status";
import { ofetch } from "ofetch";
import { ConversationModeEnum } from "@/types/conversation";
import { createParser } from "eventsource-parser";

export class Claude extends AIProvider {
  public isProcessing: boolean = false;
  private reader: ReadableStreamDefaultReader | null = null; // Variable to store ReadableStreamDefaultReader
  private organizationId: string | null = null;

  constructor() {
    super();
  }

  public async closeStream() {
    consoleLog(LogLevelEnum.DEBUG, "Closing stream");
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) {
        consoleLog(LogLevelEnum.DEBUG, e);
        this.reader = null;
      }
    }
    this.isProcessing = false;
  }

  private async genTitle(
    organizationId: string,
    conversationId: string,
    content: string
  ): Promise<void> {
    await ofetch("https://claude.ai/api/generate_chat_title", {
      method: "POST",
      body: {
        organization_uuid: organizationId,
        conversation_uuid: conversationId,
        recent_titles: [],
        message_content: content,
      },
    });
  }

  private async createConversation(organizationId: string): Promise<string> {
    const id = uuid();
    await ofetch(
      `https://claude.ai/api/organizations/${organizationId}/chat_conversations`,
      {
        method: "POST",
        body: { name: "", uuid: id },
      }
    );
    return id;
  }

  public async deleteConversation(conversationId: string): Promise<void> {
    if (this.organizationId && conversationId) {
      await ofetch(
        `https://claude.ai/api/organizations/${this.organizationId}/chat_conversations/${conversationId}`,
        {
          method: "DELETE",
        }
      );
    }
  }

  private async fetchOrganizationId(): Promise<string> {
    let resp: Response | undefined = undefined;
    try {
      resp = await fetch("https://claude.ai/api/organizations", {
        redirect: "error",
        cache: "no-cache",
      });
    } catch (err) {
      if (err instanceof AIProviderException) {
        throw new AIProviderException(
          Status.CLAUDE_UNAVAILABLE,
          "ChatGPT Unauthorized error. Please try again later."
        );
      }
    }
    if (resp!.status === 403) {
      throw new AIProviderException(
        Status.CLAUDE_UNAUTHORIZED,
        "ChatGPT Unauthorized error. Please try again later."
      );
    }
    const orgs = await resp!.json();
    return orgs[0].uuid;
  }

  public authentication = async () => {
    try {
      await this.fetchOrganizationId();
    } catch (err) {
      if (err instanceof AIProviderException) {
        throw new AIProviderException(
          Status.CLAUDE_UNAUTHORIZED,
          "Claude Unauthorized error. Please try again later."
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
        this.conversationId = conversationId ? conversationId : null;
        if (this.isProcessing) {
          reject(new AIProviderException(Status.BARD_BUSY, "Claude Busy"));
          return;
        }
        this.isProcessing = true;
        resolve(async (callback: (data: AIResponseType) => void) => {
          if (args.conversationMode === ConversationModeEnum.REGENERATE) {
          }

          const organizationId = await this.fetchOrganizationId();
          this.organizationId = organizationId;
          if (!conversationId) {
            this.conversationId = await this.createConversation(organizationId);
            this.genTitle(organizationId, this.conversationId, prompt);
          }

          const resp = await fetch("https://claude.ai/api/append_message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              organization_uuid: organizationId,
              conversation_uuid: this.conversationId,
              text: prompt,
              completion: {
                prompt: prompt,
                model: "claude-2",
              },
              attachments: [],
            }),
          });
          if (!resp.ok) {
            const error = await resp.json().catch(() => ({}));
            callback({
              type: AIResponseTypeEnum.ERROR,
              message:
                error.detail && error.detail.message
                  ? error.detail.message
                  : error.detail,
              code: Status.CHATGPT_RESPONSE_ERROR,
            });
            this.isProcessing = false;
            return null;
          }

          let finalText: string = "";
          const parser = createParser(async (event) => {
            if (event.type === "event") {
              const message = event.data;
              let data;
              try {
                data = JSON.parse(message);
              } catch (err) {
                return null;
              }

              if (data.stop_reason) {
                callback({
                  type: AIResponseTypeEnum.COMPLETE,
                  message: finalText,
                  payload: {
                    ...(!args.deleteConversation && {
                      conversationId: this.conversationId!,
                    }),
                    endTurn: true,
                  },
                });
                if (this.conversationId) {
                  if (args.deleteConversation) {
                    await this.deleteConversation(this.conversationId);
                  }
                }
              } else {
                finalText += data.completion;
                callback({
                  type: AIResponseTypeEnum.MESSAGE,
                  message: finalText,
                });
              }
            }
          });

          // Create ReadableStreamDefaultReader and store it in the reader variable
          const stream = resp.body;
          if (stream) {
            this.reader = stream.getReader();
          } else {
            callback({
              type: AIResponseTypeEnum.ERROR,
              message: "Stream is null",
              code: Status.CHATGPT_STREAM_ERROR,
            });
            this.isProcessing = false;
            return null;
          }

          // Read the stream until it's canceled or finished
          const readStream = async () => {
            try {
              while (true) {
                const { done, value } = await this.reader!.read();
                if (done) {
                  break;
                }
                const str = new TextDecoder().decode(value);
                parser.feed(str);
              }
            } catch (err) {
              // Handle stream reading errors
              callback({
                type: AIResponseTypeEnum.ERROR,
                message: "Stream error",
                code: Status.CHATGPT_STREAM_ERROR,
              });
            }
          };

          // Call the readStream() method to start reading the stream
          readStream();

          // Return the closeStream() method to allow closing the stream from the outside
          return;
        });
      }
    );
  }
}

import ExpiryMap from "expiry-map";
import { createParser } from "eventsource-parser";
import { AIResponseType, AIResponseTypeEnum } from "@/types/provider";
import { AIProvider } from "./base";
import { AIProviderException } from "./index";
import { Status } from "@/constants/status";
import { uuid } from "@/utils";
import { consoleLog, LogLevelEnum } from "@/utils";
import { ConversationModeEnum } from "@/types/conversation";

export class ChatGPT extends AIProvider {
  private static instance: ChatGPT;
  private KEY_ACCESS_TOKEN: string = "accessToken";
  private CHATGPT_URL: string = "https://chat.openai.com";
  private cache: ExpiryMap<string> = new ExpiryMap(10 * 1000);
  public token: string | null = null;
  private reader: ReadableStreamDefaultReader | null = null; // Variable to store ReadableStreamDefaultReader
  private messageId: string | null = null;
  private endTurn: boolean | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): ChatGPT {
    if (!ChatGPT.instance) {
      ChatGPT.instance = new ChatGPT();
    }
    return ChatGPT.instance;
  }

  public initCache(): ChatGPT {
    this.cache = new ExpiryMap(10 * 1000);
    return this;
  }

  private async getChatGPTAccessToken(): Promise<string> {
    if (this.cache.get(this.KEY_ACCESS_TOKEN)) {
      return this.cache.get(this.KEY_ACCESS_TOKEN);
    }
    const resp = await fetch("https://chat.openai.com/api/auth/session");
    if (resp.status === 403) {
      throw new AIProviderException(
        Status.CHATGPT_CLOUDFLARE,
        "Cloudflare error. Please try again later."
      );
    }
    const data = await resp.json().catch(() => ({}));
    if (!data.accessToken) {
      throw new AIProviderException(
        Status.CHATGPT_UNAUTHORIZED,
        "Unauthorized error. Please try again later."
      );
    }
    this.cache.set(this.KEY_ACCESS_TOKEN, data.accessToken);
    return data.accessToken;
  }

  private async request(
    token: string,
    method: string,
    path: string,
    data?: unknown
  ) {
    return fetch(`${this.CHATGPT_URL}/${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  }

  private async fetchModels(
    token: string
  ): Promise<
    { slug: string; title: string; description: string; max_tokens: number }[]
  > {
    const resp = await this.request(token, "GET", "backend-api/models").then(
      (r) => r.json()
    );
    return resp.models;
  }

  private async getModelName(token: string): Promise<string> {
    try {
      const models = await this.fetchModels(token);
      return models[0].slug;
    } catch (err) {
      console.error(err);
      return "text-davinci-002-render";
    }
  }

  private async setConversationProperty(
    token: string,
    conversationId: string,
    propertyObject: object
  ) {
    consoleLog(LogLevelEnum.DEBUG, "setConversationProperty");
    await this.request(
      token,
      "PATCH",
      `backend-api/conversation/${conversationId}`,
      propertyObject
    );
  }

  private async genTitle(
    conversationId: string,
    messageId: string
  ): Promise<string> {
    const resp = await this.request(
      this.token!,
      "POST",
      `backend-api/conversation/gen_title/${conversationId}`,
      {
        message_id: messageId,
      }
    ).then((r) => r.json());
    consoleLog(LogLevelEnum.DEBUG, resp);
    return resp.title;
  }

  private getConversations(
    token: string,
    offset: number = 0,
    limit: number = 10,
    order: string = "updated"
  ): Promise<{ items: { id: string; title: string }[] }> {
    return this.request(
      token,
      "GET",
      `backend-api/conversations?offset=${offset}&limit=${limit}&order=${order}`
    ).then((r) => r.json());
  }

  public async closeStream() {
    consoleLog(LogLevelEnum.DEBUG, "Closing stream");
    if (this.reader) {
      await this.reader.cancel();
    }
    if (this.conversationId) {
      this.setConversationProperty(this.token!, this.conversationId!, {
        is_visible: false,
      });
    }
    this.isProcessing = false;
  }

  public async deleteConversation(conversationId: string): Promise<void> {
    consoleLog(LogLevelEnum.DEBUG, "deleteConversation");
    this.token = await this.getChatGPTAccessToken();
    this.setConversationProperty(this.token!, conversationId, {
      is_visible: false,
    });
  }

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
          reject(new AIProviderException(Status.CHATGPT_BUSY, "Busy"));
          return;
        }
        this.isProcessing = true;
        resolve(async (callback: (data: AIResponseType) => void) => {
          try {
            this.token = await this.getChatGPTAccessToken();
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
          const modelName = await this.getModelName(this.token!);
          const childId = uuid();

          let payload = {};
          switch (args.conversationMode) {
            case ConversationModeEnum.NORMAL:
              payload = {
                action: "next",
                messages: [
                  {
                    id: childId,
                    author: {
                      role: "user",
                    },
                    content: {
                      content_type: "text",
                      parts: [prompt],
                    },
                    metadata: {},
                  },
                ],
                conversation_id: conversationId ? conversationId : null,
                parent_message_id: messageId ? messageId : uuid(),
                model: "text-davinci-002-render-sha",
                timezone_offset_min: -420,
                suggestions: [],
                history_and_training_disabled: false,
                arkose_token: null,
              };
              break;
            case ConversationModeEnum.REGENERATE:
              payload = {
                action: "variant",
                messages: [
                  {
                    id: args.childMessageId,
                    author: {
                      role: "user",
                      metadata: {},
                    },
                    content: {
                      content_type: "text",
                      parts: [prompt],
                    },
                    status: "finished_successfully",
                    weight: 1,
                    metadata: {
                      timestamp_: "absolute",
                    },
                    recipient: "all",
                  },
                ],
                conversation_id: conversationId,
                parent_message_id: messageId,
                model: "text-davinci-002-render-sha",
                timezone_offset_min: -420,
                variant_purpose: "comparison_implicit",
                history_and_training_disabled: false,
                arkose_token: null,
              };
              break;
            case ConversationModeEnum.CONTINUE:
              payload = {
                action: "continue",
                conversation_id: conversationId,
                parent_message_id: messageId,
                model: "text-davinci-002-render-sha",
                timezone_offset_min: -420,
                history_and_training_disabled: false,
                arkose_token: null,
              };
              break;
          }
          consoleLog(LogLevelEnum.DEBUG, "payload", payload);
          const resp = await fetch(
            this.CHATGPT_URL + "/backend-api/conversation",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token}`,
              },
              body: JSON.stringify(payload),
            }
          );
          if (!resp.ok) {
            const error = await resp.json().catch(() => ({}));
            callback({
              type: AIResponseTypeEnum.ERROR,
              message: error.detail,
              code: Status.CHATGPT_RESPONSE_ERROR,
            });
            if (this.conversationId) {
              this.setConversationProperty(this.token!, this.conversationId, {
                is_visible: false,
              });
            }
            this.isProcessing = false;
            return null;
          }
          let prevText: string = "";
          const parser = createParser(async (event) => {
            if (event.type === "event") {
              const message = event.data;
              if (message === "[DONE]") {
                callback({
                  type: AIResponseTypeEnum.COMPLETE,
                  message: prevText,
                  payload: {
                    ...(!args.deleteConversation && {
                      conversationId: this.conversationId!,
                      ...(args.conversationMode ===
                        ConversationModeEnum.REGENERATE &&
                        args.childMessageId && {
                          childMessageId: args.childMessageId,
                        }),
                      ...(args.conversationMode ===
                        ConversationModeEnum.NORMAL && {
                        childMessageId: childId,
                      }),
                    }),
                    ...(this.messageId && { messageId: this.messageId }),
                    endTurn: this.endTurn,
                  },
                });
                if (this.conversationId) {
                  if (args.deleteConversation) {
                    this.setConversationProperty(
                      this.token!,
                      this.conversationId!,
                      {
                        is_visible: false,
                      }
                    );
                  } else {
                    // const items = await this.getConversations(this.token!);
                    if (!conversationId) {
                      const title = await this.genTitle(
                        this.conversationId,
                        this.messageId!
                      );
                      consoleLog(LogLevelEnum.DEBUG, title);
                    }
                  }
                }

                this.isProcessing = false;
                return null;
              }

              let data;
              try {
                data = JSON.parse(message);
              } catch (err) {
                return null;
              }
              const text: string = data.message?.content?.parts?.[0];
              const role = data.message?.author.role;
              if (text && role === "assistant") {
                const finalText = text.replace(prevText, "");
                this.conversationId = data.conversation_id;
                callback({
                  type: AIResponseTypeEnum.MESSAGE,
                  message: finalText,
                });
                prevText = text;
              }
              if (data.message_id) {
                this.messageId = data.message_id;
              }
              if (
                data.message &&
                data.message.metadata &&
                data.message.metadata.is_complete
              ) {
                this.endTurn = data.message.end_turn;
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
            if (this.conversationId) {
              this.setConversationProperty(this.token!, this.conversationId, {
                is_visible: false,
              });
            }
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
              if (this.conversationId) {
                this.setConversationProperty(this.token!, this.conversationId, {
                  is_visible: false,
                });
              }
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

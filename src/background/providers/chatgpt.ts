import ExpiryMap from "expiry-map";
import { createParser } from "eventsource-parser";
import { AIResponseType, AIResponseTypeEnum } from "../../types/provider";
import { AIProvider } from "./base";
import { AIProviderException } from "./index";
import { status } from "../../constants/status";
import { uuid } from "../../utils";

export class ChatGPT extends AIProvider {
  private static instance: ChatGPT;
  private KEY_ACCESS_TOKEN: string = "accessToken";
  private CHATGPT_URL: string = "https://chat.openai.com";
  private cache: ExpiryMap<string> = new ExpiryMap(10 * 1000);
  public token: string | null = null;
  private reader: ReadableStreamDefaultReader | null = null; // Variable to store ReadableStreamDefaultReader
  private conversationId: string | null = null;

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
        status.CHATGPT_CLOUDFLARE,
        "Cloudflare error. Please try again later."
      );
    }
    const data = await resp.json().catch(() => ({}));
    if (!data.accessToken) {
      throw new AIProviderException(
        status.CHATGPT_UNAUTHORIZED,
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
    await this.request(
      token,
      "PATCH",
      `backend-api/conversation/${conversationId}`,
      propertyObject
    );
  }

  public async closeStream() {
    console.log("Closing stream");
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

  async conversation(
    prompt: string,
    isStream: boolean
  ): Promise<(callback: (data: AIResponseType) => void) => void> {
    return new Promise<(callback: (data: AIResponseType) => void) => void>(
      (resolve, reject) => {
        if (this.isProcessing) {
          reject(new AIProviderException(status.CHATGPT_BUSY, "Busy"));
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
          const resp = await fetch(
            this.CHATGPT_URL + "/backend-api/conversation",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token}`,
              },
              body: JSON.stringify({
                action: "next",
                messages: [
                  {
                    id: uuid(),
                    role: "user",
                    content: {
                      content_type: "text",
                      parts: [prompt],
                    },
                  },
                ],
                model: modelName,
                parent_message_id: uuid(),
              }),
            }
          );
          if (!resp.ok) {
            const error = await resp.json().catch(() => ({}));
            callback({
              type: AIResponseTypeEnum.ERROR,
              message: "ChatGPT response error",
              code: status.CHATGPT_RESPONSE_ERROR,
            });
            this.isProcessing = false;
            return null;
          }
          let prevText: string = "";
          const parser = createParser((event) => {
            if (event.type === "event") {
              const message = event.data;
              if (message === "[DONE]") {
                callback({
                  type: AIResponseTypeEnum.COMPLETE,
                  message: prevText,
                });
                if (this.conversationId) {
                  this.setConversationProperty(
                    this.token!,
                    this.conversationId!,
                    {
                      is_visible: false,
                    }
                  );
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
              code: status.CHATGPT_STREAM_ERROR,
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
                code: status.CHATGPT_STREAM_ERROR,
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

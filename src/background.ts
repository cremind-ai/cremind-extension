import { AIResponseType, AIResponseTypeEnum } from "./types/provider";
import {
  IPCMessageType,
  IPCTopicEnum,
  ConversationMessageTypeEnum,
  CommunicationMessageTypeEnum,
} from "./types";
import { IPCHost } from "./lib/ipc_host";
import { AIProvider } from "./background/providers/base";
import { AIProviderFactory } from "./background/providers";
import { AIMode } from "./constants";
import { LLMMODE } from "./types";
import { consoleLog, LogLevelEnum } from "./utils";
import CryptoES from "crypto-es";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data: IPCMessageType = request;
  if (data && data.topic === IPCTopicEnum.COMMUNICATION) {
    if (data.type === CommunicationMessageTypeEnum.GET_FEATURES) {
      try {
        const bytes = CryptoES.AES.decrypt(
          process.env.VUE_APP_CRYPTO_CONFIG_JSON!,
          process.env.VUE_APP_CRYPTO_SECRET_KEY!
        );
        var originalText = bytes.toString(CryptoES.enc.Utf8);

        sendResponse({ decrypted: JSON.parse(originalText) });
      } catch (err) {
        sendResponse({ decrypted: null });
      }
    } else if (data.type === CommunicationMessageTypeEnum.OPEN_OPTIONS_PAGE) {
      chrome.runtime.openOptionsPage();
      sendResponse({});
    }
  }

  return;
});

let aiProvider: AIProvider;
const aiMode: AIMode = AIMode.CHAT_GPT;
if (aiMode === AIMode.CHAT_GPT) {
  aiProvider = AIProviderFactory.createChatGPT();
} else if (aiMode === AIMode.OPENAI_API) {
  aiProvider = AIProviderFactory.createOpenAI("");
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "menu",
    title: "cWord",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "menu") {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs.sendMessage(tab!.id!, {});
      });
    });
  }
});

const ipcHost = IPCHost.getInstance().initConnection();
ipcHost.register(
  IPCTopicEnum.CONVERSATION,
  async (data: IPCMessageType, sendResponse) => {
    consoleLog(LogLevelEnum.DEBUG, data);
    consoleLog(LogLevelEnum.DEBUG, "isProcessing " + aiProvider.isProcessing);
    if (
      data &&
      data.type === ConversationMessageTypeEnum.STREAM &&
      data.payload.mode === LLMMODE.COMMUNICATION
    ) {
      if (aiProvider.isProcessing) {
        await aiProvider.closeStream();
      }

      aiProvider
        .conversation(
          data.payload.conversationId ? data.payload.conversationId : null,
          data.payload.messageId ? data.payload.messageId : null,
          data.payload.message,
          true,
          {
            deleteConversation: data.payload.deleteConversation,
            regenerate: data.payload.regenerate,
            childMessageId: data.payload.childMessageId,
          }
        )
        .then(async (callback) => {
          callback((resData: AIResponseType) => {
            if (resData && resData.type === AIResponseTypeEnum.MESSAGE) {
              sendResponse(ConversationMessageTypeEnum.STREAM, {
                message: resData.message,
              });
            } else if (
              resData &&
              resData.type === AIResponseTypeEnum.COMPLETE
            ) {
              const payload = {
                message: resData.message,
                ...(!data.payload.deleteConversation && {
                  conversationId: resData.payload!.conversationId,
                  messageId: resData.payload!.messageId,
                  childMessageId: resData.payload!.childMessageId,
                }),
              };
              sendResponse(ConversationMessageTypeEnum.COMPLETE, payload);
            } else if (resData && resData.type === AIResponseTypeEnum.ERROR) {
              sendResponse(ConversationMessageTypeEnum.ERROR, {
                code: resData.code,
                message: resData.message,
              });
            }
          });
        });
    } else if (
      data &&
      data.type === ConversationMessageTypeEnum.MESSAGE &&
      data.payload.mode === LLMMODE.COMMUNICATION
    ) {
      if (aiProvider.isProcessing) {
        await aiProvider.closeStream();
      }

      aiProvider
        .conversation(
          data.payload.conversationId ? data.payload.conversationId : null,
          data.payload.messageId ? data.payload.messageId : null,
          data.payload.message,
          true,
          {
            deleteConversation: data.payload.deleteConversation,
            regenerate: data.payload.regenerate,
            ...(data.payload.childMessageId && {
              childMessageId: data.payload.childMessageId,
            }),
          }
        )
        .then(async (callback) => {
          callback((resData: AIResponseType) => {
            if (resData && resData.type === AIResponseTypeEnum.MESSAGE) {
            } else if (
              resData &&
              resData.type === AIResponseTypeEnum.COMPLETE
            ) {
              const payload = {
                message: resData.message,
                ...(!data.payload.deleteConversation && {
                  conversationId: resData.payload!.conversationId,
                  messageId: resData.payload!.messageId,
                  ...(data.payload.childMessageId && {
                    childMessageId: data.payload.childMessageId,
                  }),
                }),
              };
              sendResponse(ConversationMessageTypeEnum.COMPLETE, payload);
            } else if (resData && resData.type === AIResponseTypeEnum.ERROR) {
              sendResponse(ConversationMessageTypeEnum.ERROR, {
                code: resData.code,
                message: resData.message,
              });
            }
          });
        });
    } else if (
      data &&
      data.type === ConversationMessageTypeEnum.MESSAGE &&
      data.payload.mode === LLMMODE.DELETE_CONVERSATION
    ) {
      aiProvider.deleteConversation(data.payload.conversationId);
      sendResponse(ConversationMessageTypeEnum.COMPLETE, {
        status: "success",
      });
    } else if (
      data &&
      data.type === ConversationMessageTypeEnum.MESSAGE &&
      data.payload.mode === LLMMODE.STOP_GENERATING
    ) {
      aiProvider.closeStream();
      const payload = {
        message: "Stopped generating",
        conversationId: aiProvider.conversationId,
      };
      sendResponse(ConversationMessageTypeEnum.COMPLETE, payload);
    }
  }
);

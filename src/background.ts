import { AIResponseType, AIResponseTypeEnum } from "./types/provider";
import {
  CommunicationMessageType,
  CommunicationMessageTopicEnum,
  CommunicationMessageTypeEnum,
} from "./types";
import { IPCHost } from "./lib/ipc_host";
import { AIProvider } from "./background/providers/base";
import { AIProviderFactory } from "./background/providers";
import { AIMode } from "./constants";
import { LLMMODE } from "./types";
/* Example
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse("hello from background");
  return;
});
*/

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
  CommunicationMessageTopicEnum.CONVERSATION,
  async (data: CommunicationMessageType, sendResponse) => {
    console.log(data);
    console.log("isProcessing " + aiProvider.isProcessing);
    if (
      data &&
      data.type === CommunicationMessageTypeEnum.STREAM &&
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
              sendResponse(CommunicationMessageTypeEnum.STREAM, {
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
              sendResponse(CommunicationMessageTypeEnum.COMPLETE, payload);
            } else if (resData && resData.type === AIResponseTypeEnum.ERROR) {
              sendResponse(CommunicationMessageTypeEnum.ERROR, {
                code: resData.code,
                message: resData.message,
              });
            }
          });
        });
    } else if (
      data &&
      data.type === CommunicationMessageTypeEnum.MESSAGE &&
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
              sendResponse(CommunicationMessageTypeEnum.COMPLETE, payload);
            } else if (resData && resData.type === AIResponseTypeEnum.ERROR) {
              sendResponse(CommunicationMessageTypeEnum.ERROR, {
                code: resData.code,
                message: resData.message,
              });
            }
          });
        });
    } else if (
      data &&
      data.type === CommunicationMessageTypeEnum.MESSAGE &&
      data.payload.mode === LLMMODE.DELETE_CONVERSATION
    ) {
      aiProvider.deleteConversation(data.payload.conversationId);
      sendResponse(CommunicationMessageTypeEnum.COMPLETE, {
        status: "success",
      });
    } else if (
      data &&
      data.type === CommunicationMessageTypeEnum.MESSAGE &&
      data.payload.mode === LLMMODE.STOP_GENERATING
    ) {
      aiProvider.closeStream();
      sendResponse(CommunicationMessageTypeEnum.COMPLETE, {
        status: "success",
      });
    }
  }
);

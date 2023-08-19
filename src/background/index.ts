import { AIResponseType, AIResponseTypeEnum } from "@/types/provider";
import {
  IPCMessageType,
  IPCTopicEnum,
  ConversationMessageTypeEnum,
  CommunicationMessageTypeEnum,
  LLMMODE,
  ResPayloadType,
} from "@/types";
import { IPCHost } from "@/lib/ipc_host";
import { AIProvider } from "./providers/base";
import { AIProviderFactory } from "./providers";
import { AIMode } from "@/constants";
import { consoleLog, LogLevelEnum } from "@/utils";
import { CWException } from "@/types/exception";
import { Status } from "@/constants/status";
import { ChromeStorage } from "@/hooks/chrome_storage";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data: IPCMessageType = request;
  if (data && data.topic === IPCTopicEnum.COMMUNICATION) {
    if (data.type === CommunicationMessageTypeEnum.GET_FEATURES) {
      fetch(`${import.meta.env.VITE_CREMIND_API!}/prompt/features`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new CWException(
              Status.BACKEND_REQUEST_UNKNOWN_ERROR,
              "Request unknown error"
            );
          }
          return response.json();
        })
        .then((resData: ResPayloadType) => {
          sendResponse({ features: resData.payload.features });
          if (resData.status === Status.SUCCESS && resData.payload.features) {
            ChromeStorage.getInstance().set(
              "FEATURES_JSON",
              JSON.stringify(resData.payload.features)
            );
          }
        })
        .catch((error) => {
          ChromeStorage.getInstance()
            .get("FEATURES_JSON")
            .then((value) => {
              if (value) {
                sendResponse({ features: JSON.parse(value) });
              } else {
                sendResponse({ features: null });
              }
            });
        });
    } else if (data.type === CommunicationMessageTypeEnum.OPEN_OPTIONS_PAGE) {
      chrome.runtime.openOptionsPage();
      sendResponse({});
    }
  }
  return true;
});

let aiProvider: AIProvider;
const aiMode = AIMode.CHAT_GPT as AIMode;
if (aiMode === AIMode.CHAT_GPT) {
  aiProvider = AIProviderFactory.createChatGPT();
} else if (aiMode === AIMode.OPENAI_API) {
  aiProvider = AIProviderFactory.createOpenAI("");
} else if (aiMode === AIMode.BARD) {
  aiProvider = AIProviderFactory.createBard("");
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "menu",
    title: "CreMind",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener(function (info) {
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
            conversationMode: data.payload.conversationMode,
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
                  endTurn: resData.payload!.endTurn,
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
            conversationMode: data.payload.conversationMode,
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
                  endTurn: resData.payload!.endTurn,
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
      try {
        aiProvider.deleteConversation(data.payload.conversationId);
      } catch (err) {
        consoleLog(LogLevelEnum.ERROR, err);
      }

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
    } else if (
      data &&
      data.type === ConversationMessageTypeEnum.MESSAGE &&
      data.payload.mode === LLMMODE.CONTINUE_GENERATING
    ) {
      // aiProvider.closeStream();
      const payload = {
        message: "continued generating",
        // conversationId: aiProvider.conversationId,
      };
      sendResponse(ConversationMessageTypeEnum.COMPLETE, payload);
    }
  }
);

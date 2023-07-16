import { AIResponseType, AIResponseTypeEnum } from "./types/provider";
import {
  CommunicationMessageType,
  CommunicationMessageTopicEnum,
  CommunicationMessageTypeEnum,
} from "./types";
import { IPCHost } from "./lib/ipc_host";
import { AIProvider } from "./background/providers/base";
import { AIProviderFactory } from "./background/providers";
/* Example
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse("hello from background");
  return;
});
*/

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
    if (data && data.type === CommunicationMessageTypeEnum.STREAM) {
      let aiProvider: AIProvider;
      aiProvider = AIProviderFactory.createChatGPT();
      console.log("isProcessing " + aiProvider.isProcessing);
      if (aiProvider.isProcessing) {
        await aiProvider.closeStream();
      }

      aiProvider
        .conversation(data.payload.message!, true)
        .then(async (callback) => {
          callback((data: AIResponseType) => {
            if (data && data.type === AIResponseTypeEnum.MESSAGE) {
              sendResponse(CommunicationMessageTypeEnum.STREAM, {
                message: data.message,
              });
            } else if (data && data.type === AIResponseTypeEnum.COMPLETE) {
              sendResponse(CommunicationMessageTypeEnum.COMPLETE, {
                message: data.message,
              });
            } else if (data && data.type === AIResponseTypeEnum.ERROR) {
              sendResponse(CommunicationMessageTypeEnum.ERROR, {
                code: data.code,
                message: data.message,
              });
            }
          });
        });
    } else if (data && data.type === CommunicationMessageTypeEnum.MESSAGE) {
      let aiProvider: AIProvider;
      aiProvider = AIProviderFactory.createChatGPT();
      console.log("isProcessing " + aiProvider.isProcessing);
      if (aiProvider.isProcessing) {
        await aiProvider.closeStream();
      }

      aiProvider
        .conversation(data.payload.message!, false)
        .then(async (callback) => {
          callback((data: AIResponseType) => {
            if (data && data.type === AIResponseTypeEnum.MESSAGE) {
            } else if (data && data.type === AIResponseTypeEnum.COMPLETE) {
              sendResponse(CommunicationMessageTypeEnum.COMPLETE, {
                message: data.message,
              });
            } else if (data && data.type === AIResponseTypeEnum.ERROR) {
              sendResponse(CommunicationMessageTypeEnum.ERROR, {
                code: data.code,
                message: data.message,
              });
            }
          });
        });
    }
  }
);

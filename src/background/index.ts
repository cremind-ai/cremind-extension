import {
  filter,
  has,
  map,
  values,
  intersection,
  difference,
  find,
  sortBy,
} from "lodash-es";
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
import { AIProviderException, AIProviderFactory } from "./providers";
import { AIMode } from "@/constants";
import { consoleLog, LogLevelEnum } from "@/utils";
import { CMException } from "@/types/exception";
import { Status } from "@/constants/status";
import { ChromeStorage } from "@/hooks/chrome_storage";
import { CategoryFeatureEnum, FeatureSchema } from "@/lib/features";

function processFeature(
  features: FeatureSchema[],
  page: number,
  size: number,
  featureType: CategoryFeatureEnum | null,
  category: CategoryFeatureEnum | null
): {
  total: number;
  list: FeatureSchema[];
} {
  let total = features.length;
  if (featureType) {
    features = filter(features, (item: FeatureSchema) =>
      has(item, featureType)
    );
    total = features.length;
  }
  if (category && category !== CategoryFeatureEnum.ALL) {
    features = features.filter(
      (item: FeatureSchema) => item.category === category
    );
    total = features.length;
  }

  if (size > 0) {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;

    if (startIndex >= features.length) {
      features = [];
      total = 0;
    } else {
      features = features.slice(
        startIndex,
        endIndex >= features.length ? undefined : endIndex
      );
    }
  }
  return { total: total, list: features };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data: IPCMessageType = request;
  if (data && data.topic === IPCTopicEnum.COMMUNICATION) {
    if (data.type === CommunicationMessageTypeEnum.GET_FEATURES) {
      const page = parseInt(data.payload.page) || 1;
      const size = parseInt(data.payload.size) || 10000;
      if (data.payload && data.payload.cache) {
        ChromeStorage.getInstance()
          .getWithWildcard("FEATURES_JSON:")
          .then((value) => {
            let featuresStore = values(value).map((jsonString) =>
              JSON.parse(jsonString)
            );
            featuresStore = sortBy(featuresStore, "timestamp");
            const res = processFeature(
              featuresStore,
              page,
              size,
              data.payload.featureType,
              data.payload.category
            );
            sendResponse({ features: res.list, total: res.total });
          });
      } else {
        fetch(`${import.meta.env.VITE_CREMIND_API!}/prompt/features`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new CMException(
                Status.BACKEND_REQUEST_UNKNOWN_ERROR,
                "Request unknown error"
              );
            }
            return response.json();
          })
          .then((resData: ResPayloadType) => {
            if (resData.status === Status.SUCCESS && resData.payload.features) {
              const currentIds = map(resData.payload.features, "id");

              ChromeStorage.getInstance()
                .getWithWildcard("FEATURES_JSON:")
                .then((value) => {
                  let featuresStore = values(value).map((jsonString) =>
                    JSON.parse(jsonString)
                  );
                  const storeIds = map(featuresStore, "id");

                  const tempArray = intersection(storeIds, currentIds);
                  const rms = difference(storeIds, currentIds);
                  const adds = difference(currentIds, tempArray);

                  for (const id of adds) {
                    const feature = find(resData.payload.features, ["id", id]);
                    for (let key in feature) {
                      if (
                        feature.READONLY === feature[key] ||
                        feature.EDITABLE === feature[key] ||
                        feature.PROMPT === feature[key] ||
                        feature.UPLOAD === feature[key]
                      ) {
                        for (let keyVar in feature[key].variableSchema) {
                          feature[key].variableSchema[keyVar]["value"] = null;
                          feature[key].variableSchema[keyVar]["customOptions"] =
                            [];
                        }
                      }
                    }

                    ChromeStorage.getInstance().set(
                      `FEATURES_JSON:${id}`,
                      JSON.stringify(feature)
                    );
                    featuresStore.push(feature);
                  }

                  for (const id of rms) {
                    ChromeStorage.getInstance().remove(`FEATURES_JSON:${id}`);
                    featuresStore = featuresStore.filter(
                      (obj) => obj.id !== id
                    );
                  }
                  featuresStore = sortBy(featuresStore, "timestamp");
                  const res = processFeature(
                    featuresStore,
                    page,
                    size,
                    data.payload.featureType,
                    data.payload.category
                  );
                  sendResponse({ features: res.list, total: res.total });
                });
            }
          })
          .catch(async (error) => {
            ChromeStorage.getInstance()
              .getWithWildcard("FEATURES_JSON:")
              .then((value) => {
                let featuresStore = values(value).map((jsonString) =>
                  JSON.parse(jsonString)
                );
                featuresStore = sortBy(featuresStore, "timestamp");
                const res = processFeature(
                  featuresStore,
                  page,
                  size,
                  data.payload.featureType,
                  data.payload.category
                );
                sendResponse({ features: res.list, total: res.total });
              });
          });
      }
    } else if (data.type === CommunicationMessageTypeEnum.SET_FEATURES) {
      const feature: FeatureSchema = data.payload.feature;
      ChromeStorage.getInstance().set(
        `FEATURES_JSON:${feature.id}`,
        JSON.stringify(feature)
      );
      sendResponse({});
    } else if (data.type === CommunicationMessageTypeEnum.OPEN_OPTIONS_PAGE) {
      chrome.runtime.openOptionsPage();
      sendResponse({});
    }
  }
  return true;
});

let aiProvider: AIProvider;
const aiProviderChatGPT = AIProviderFactory.createChatGPT();
const aiProviderClaude = AIProviderFactory.createClaude();
const aiProviderGemini = AIProviderFactory.createGemini();
const aiProviderOpenAI = AIProviderFactory.createOpenAI("");

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage();
    chrome.tabs.create({
      url: import.meta.env.VITE_CREMIND_GETTING_STARTED_URL!,
    });
  }

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
    const aiMode: AIMode = data.payload.aiProvider;
    if (aiMode === AIMode.CHAT_GPT) {
      aiProvider = aiProviderChatGPT;
    } else if (aiMode === AIMode.GEMINI) {
      aiProvider = aiProviderGemini;
    } else if (aiMode === AIMode.OPENAI_API) {
      aiProvider = aiProviderOpenAI;
    } else if (aiMode === AIMode.CLAUDE) {
      aiProvider = aiProviderClaude;
    }

    consoleLog(LogLevelEnum.DEBUG, aiMode);
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
            ...data.payload,
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
                  contextIds: resData.payload!.contextIds,
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
            ...data.payload,
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
                  childMessageId: resData.payload!.childMessageId,
                  endTurn: resData.payload!.endTurn,
                  contextIds: resData.payload!.contextIds,
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
      data.payload.mode === LLMMODE.AUTHENTICATION
    ) {
      try {
        await aiProvider.authentication();
        const payload = {
          status: Status.SUCCESS,
          message: "Authentication Successful",
        };
        sendResponse(ConversationMessageTypeEnum.COMPLETE, payload);
      } catch (err) {
        if (err instanceof AIProviderException) {
          sendResponse(ConversationMessageTypeEnum.ERROR, {
            status: Status.ERROR,
            code: err.code,
            message: err.message,
          });
        }
      }
    }
  }
);

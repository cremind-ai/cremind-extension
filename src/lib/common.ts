import { concat } from "lodash-es";
import {
  CommunicationMessageTypeEnum,
  IPCMessageType,
  IPCTopicEnum,
} from "@/types";
import { FeatureSchema } from "./features";
import { ChromeStorage } from "@/hooks/chrome_storage";

const getJsonFeatures = async (): Promise<FeatureSchema[]> => {
  return new Promise<FeatureSchema[]>((resolve, reject) => {
    const data: IPCMessageType = {
      topic: IPCTopicEnum.COMMUNICATION,
      type: CommunicationMessageTypeEnum.GET_FEATURES,
      message: "Get JSON Features",
    };
    let featureList = [];
    chrome.runtime.sendMessage(data, async (response) => {
      if (response.features) {
        for (let feature of response.features) {
          for (let key in feature) {
            if (
              feature.READONLY === feature[key] ||
              feature.EDITABLE === feature[key] ||
              feature.READONLY_CONTEXT_MENU === feature[key] ||
              feature.EDITABLE_CONTEXT_MENU === feature[key] ||
              feature.APP === feature[key]
            ) {
              for (let keyVar in feature[key].variableSchema) {
                if (feature[key].variableSchema[keyVar].options) {
                  const storageKey = `FEATURE:${feature.id}:${key}:custom_options:${keyVar}`;
                  const value = await ChromeStorage.getInstance().get(
                    storageKey
                  );
                  if (value) {
                    const arrList: string[] = JSON.parse(value);
                    feature[key].variableSchema[keyVar].options = concat(
                      feature[key].variableSchema[keyVar].options,
                      arrList
                    );
                  }
                }
              }
            }
          }
        }
        featureList = response.features;
      } else {
        featureList = [];
      }
      resolve(featureList);
    });
  });
};

export { getJsonFeatures };

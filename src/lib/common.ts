import { concat } from "lodash-es";
import {
  CommunicationMessageTypeEnum,
  IPCMessageType,
  IPCTopicEnum,
  FeatureModeEnum,
} from "@/types";
import { CategoryFeatureEnum, FeatureSchema } from "./features";

/**
 *
 * @param cache
 * @param page 1 - n
 * @param size
 * @returns
 */
const getJsonFeatures = async (
  cache: boolean,
  page: number,
  size: number,
  featureType: FeatureModeEnum | null,
  category: CategoryFeatureEnum | null
): Promise<{ total: number; list: FeatureSchema[] }> => {
  return new Promise<{ total: number; list: FeatureSchema[] }>(
    (resolve, reject) => {
      const data: IPCMessageType = {
        topic: IPCTopicEnum.COMMUNICATION,
        type: CommunicationMessageTypeEnum.GET_FEATURES,
        payload: {
          cache: cache,
          page: page,
          size: size,
          featureType: featureType,
          category: category,
        },
        message: "Get JSON Features",
      };
      let featureList = [];
      chrome.runtime.sendMessage(data, async (response) => {
        let total = 0;
        if (response.features) {
          featureList = response.features;
          total = response.total;
        } else {
          featureList = [];
        }
        resolve({ total: total, list: featureList });
      });
    }
  );
};

/**
 *
 * @param feature
 * @returns
 */
const setJsonFeature = (feature: FeatureSchema): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const data: IPCMessageType = {
      topic: IPCTopicEnum.COMMUNICATION,
      type: CommunicationMessageTypeEnum.SET_FEATURES,
      payload: { feature: feature },
      message: "Set JSON Feature",
    };
    chrome.runtime.sendMessage(data, async () => {
      resolve();
    });
  });
};

export { getJsonFeatures, setJsonFeature };

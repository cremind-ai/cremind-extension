import { defineStore } from "pinia";
import { CMException } from "@/types/exception";
import { Status } from "@/constants/status";
import { ResPayloadType } from "@/types";

export type ChatGPTModel = {
  name: string;
  model: string;
};

interface APIState {}

export const useAPIStore = defineStore({
  id: "API",
  state: (): APIState => {
    return {};
  },
  getters: {},
  actions: {
    getChatgptModels(): Promise<ChatGPTModel[]> {
      return new Promise((resolve, reject) => {
        fetch(`${import.meta.env.VITE_CREMIND_API!}/system/chatgpt`, {
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
            if (resData.status === Status.SUCCESS && resData.payload.models) {
              resolve(resData.payload.models);
            } else {
              reject(
                new CMException(
                  Status.FAILED_TO_LOAD_MODELS,
                  "Failed to load models"
                )
              );
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});

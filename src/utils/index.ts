import { ResPayloadType } from "@/types";
import { consoleLog, LogLevelEnum } from "./log";
import { Status } from "@/constants/status";
import { CWException } from "@/types/exception";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function* streamAsyncIterable(stream: ReadableStream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tokenConcat(texts: string[], chunkSize: number): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fetch(`${import.meta.env.VITE_UNSTRUCTURED_API!}/loader/token_concat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts: texts, chunk_size: chunkSize }),
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
        if (resData.status === Status.SUCCESS && resData.payload) {
          resolve(resData.payload.items);
        }
      })
      .catch((error) => {
        reject(
          new CWException(Status.BACKEND_REQUEST_UNKNOWN_ERROR, error.message)
        );
      });
  });
}

export {
  uuid,
  streamAsyncIterable,
  sleep,
  tokenConcat,
  consoleLog,
  LogLevelEnum,
};

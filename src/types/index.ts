export enum CommunicationMessageTypeEnum {
  STREAM = "stream",
  MESSAGE = "message",
  COMPLETE = "complete",
  ERROR = "error",
}

export enum CommunicationMessageTopicEnum {
  CONVERSATION = "conversation",
}

export type CommunicationMessageType = {
  topic: CommunicationMessageTopicEnum;
  type: CommunicationMessageTypeEnum;
  requestId: string;
  payload?: any;
  message?: string;
  code?: number;
};

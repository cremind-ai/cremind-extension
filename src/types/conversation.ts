import { ConversationRoleEnum } from "@/constants";

export type ConversationMessageType = {
  role: ConversationRoleEnum;
  text: string;
};

export enum ConversationModeEnum {
  NORMAL = 0,
  REGENERATE = 1,
  CONTINUE = 2,
}

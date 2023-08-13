import { ConversationRoleEnum } from '@/constants'

export type ConversationMessageType = {
  role: ConversationRoleEnum
  text: string
}

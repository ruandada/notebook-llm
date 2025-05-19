import { ChatMessage } from './chat-message.type'

export interface Chat {
  id: string
  title: string
  createTime: Date
  useDefaultTitle: boolean
  extra: {
    last_message_role?: ChatMessage['role']
    last_message_text?: string
  }
}

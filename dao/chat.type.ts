import { ChatMessage } from './chat-message.type'
import i18n from '@/core/i18n'

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

export const getChatTitle = (chat: Chat): string => {
  if (chat.useDefaultTitle) {
    return i18n.t('chat.default_title')
  }
  return chat.title || i18n.t('chat.no_title')
}

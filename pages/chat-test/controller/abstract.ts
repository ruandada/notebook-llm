import type { ChatMessage } from '@/dao/chat-message.type'
import type { MessageController } from './message-controller'

export interface MessageWithMetadata<M extends ChatMessage = ChatMessage> {
  msg: M
  status?: 'finished' | 'building'
}

export interface AsyncMessageBuilder<M extends ChatMessage> {
  create: (chatId: string) => M
  build: (messageId: string, controller: MessageController) => Promise<void>
}

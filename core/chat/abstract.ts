import type { ChatMessage } from '@/dao/chat-message.type'
import type { MessageController } from './message-controller'

export interface MessageWithMetadata<M extends ChatMessage = ChatMessage> {
  msg: M
  status: 'finished' | 'building'
  stage: 'processing' | 'history' | 'justFinished'
}

export interface AsyncMessageBuilder {
  create: (chatId: string) => ChatMessage
  build: (messageId: string, controller: MessageController) => Promise<void>
}

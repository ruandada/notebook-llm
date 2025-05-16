import { ChatMessage } from '@/dao/chat-message.type'

export interface MessageWithMetadata<M extends ChatMessage = ChatMessage> {
  msg: M
  status?: 'finished' | 'building'
}

export type MessageUpdateMethod<M extends ChatMessage> = (
  by: (m: M) => M
) => void

export interface AsyncMessageBuilder<M extends ChatMessage> {
  create: (chatId: string) => M
  build: (update: MessageUpdateMethod<M>) => Promise<void>
}

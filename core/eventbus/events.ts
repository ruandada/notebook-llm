import { Chat } from '@/dao/chat.type'
import { EventbusEvent } from './eventbus'

export interface ChatCreatedEvent extends EventbusEvent {
  event: 'chat.created'
  data: {
    chat: Chat
  }
}

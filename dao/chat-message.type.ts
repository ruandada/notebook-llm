import { messageId } from '@/core/idgenerator'

export interface ChatMessageBase {
  id: string
  time: Date
  chatId: string
  role: string
  searchTerm: string
  extra: Record<string, any>
}

export interface TextChatMessage extends ChatMessageBase {
  type: 'text'
  content: {
    text: string
  }
}

export interface StreamTextMessage extends ChatMessageBase {
  type: 'stream_text'
  content: {
    buffer: string[]
  }
}

export interface ErrorMessage extends ChatMessageBase {
  type: 'error'
  content: {
    message: string
  }
}

export type ChatMessage = TextChatMessage | StreamTextMessage | ErrorMessage

export const buildTextMessage = (
  text: string,
  chatId: string,
  role: string
): TextChatMessage => ({
  id: messageId(),
  time: new Date(),
  chatId: chatId,
  role: role,
  searchTerm: '',
  extra: {},
  type: 'text',
  content: {
    text: text,
  },
})

export const buildStreamTextMessage = (
  chatId: string,
  role: string = 'assistant'
): StreamTextMessage => ({
  id: messageId(),
  time: new Date(),
  chatId: chatId,
  role: role,
  searchTerm: '',
  extra: {},
  type: 'stream_text',
  content: {
    buffer: [],
  },
})

export const isTextMessage = (
  message: ChatMessage
): message is TextChatMessage => {
  return message.type === 'text'
}

export const isStreamTextMessage = (
  message: ChatMessage
): message is StreamTextMessage => {
  return message.type === 'stream_text'
}

export const isErrorMessage = (
  message: ChatMessage
): message is ErrorMessage => {
  return message.type === 'error'
}

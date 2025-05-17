import { messageId } from '@/core/idgenerator'

export interface MessageBase {
  id: string
  time: Date
  chatId: string
  role: string
  searchTerm: string
  extra: Record<string, any>
}

export interface TextMessage extends MessageBase {
  type: 'text'
  content: {
    text: string
  }
}

export interface StreamTextMessage extends MessageBase {
  type: 'stream_text'
  content: {
    buffer: string[]
  }
}

export interface ToolMessage extends MessageBase {
  type: 'tool_message'
  content: {
    title: string
    tool_id: string
    tool_call_id: string
    arguments?: Record<string, any>
    result?: any
    result_status?: 'success' | 'failed'
  }
}

export interface ErrorMessage extends MessageBase {
  type: 'error'
  content: {
    message: string
  }
}

export type ChatMessage =
  | TextMessage
  | StreamTextMessage
  | ToolMessage
  | ErrorMessage

export const buildTextMessage = (
  chatId: string,
  text: string,
  role: string
): TextMessage => ({
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

export const buildToolMessage = (chatId: string): ToolMessage => ({
  id: messageId(),
  time: new Date(),
  chatId,
  role: 'assistant',
  searchTerm: '',
  extra: {},
  type: 'tool_message',
  content: {
    tool_id: '',
    tool_call_id: '',
    arguments: {},
    title: '',
  },
})

export const buildStreamTextMessage = (
  chatId: string,
  role: string = 'assistant'
): StreamTextMessage => ({
  id: messageId(),
  time: new Date(),
  chatId,
  role: role,
  searchTerm: '',
  extra: {},
  type: 'stream_text',
  content: {
    buffer: [],
  },
})

export const buildErrorMessage = (
  chatId: string,
  errorMessage: string,
  role: string = 'assistant'
): ErrorMessage => ({
  id: messageId(),
  time: new Date(),
  chatId,
  role,
  searchTerm: '',
  extra: {},
  type: 'error',
  content: {
    message: errorMessage,
  },
})

export const isTextMessage = (message: ChatMessage): message is TextMessage => {
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

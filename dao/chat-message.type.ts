import { messageId } from '@/core/idgenerator'
import i18n from '@/core/i18n'

export interface ToolCallData {
  title: string
  tool_id: string
  tool_name: string
  tool_call_id: string
  parameter: string
  result?: any
  result_status?: 'success' | 'failed'
}

export interface MessageBase {
  id: string
  time: Date
  chatId: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  searchTerm: string
  extra: {
    tool_call?: ToolCallData
  }
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

export interface ErrorMessage extends MessageBase {
  type: 'error'
  content: {
    reason: string
  }
}

export type ChatMessage = TextMessage | StreamTextMessage | ErrorMessage

export const buildTextMessage = (
  chatId: string,
  text: string,
  role: MessageBase['role']
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

export const buildStreamTextMessage = (
  chatId: string,
  role: MessageBase['role'] = 'assistant'
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
  reason: string,
  role: MessageBase['role'] = 'assistant'
): ErrorMessage => ({
  id: messageId(),
  time: new Date(),
  chatId,
  role,
  searchTerm: '',
  extra: {},
  type: 'error',
  content: {
    reason,
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

export const isEmptyMessage = (message: ChatMessage): boolean => {
  if (message.extra?.tool_call) {
    return false
  }

  return isTextMessage(message)
    ? !message.content.text
    : isStreamTextMessage(message)
    ? !message.content.buffer.length
    : isErrorMessage(message)
    ? !message.content.reason
    : false
}

export const getMessageTextContent = (message: ChatMessage): string => {
  let text = ''
  if (isTextMessage(message)) {
    text = message.content.text
  } else if (isStreamTextMessage(message)) {
    text = message.content.buffer.join('')
  } else if (isErrorMessage(message)) {
    text = message.content.reason
  } else {
    text = `[${i18n.t('msg.non_text')}]`
  }

  return text
}

import {
  ChatMessage,
  isStreamTextMessage,
  isTextMessage,
  StreamTextMessage,
  TextMessage,
} from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { ViewProps } from 'react-native'
import { StreamTextMessageView } from './steram-text-message-view'
import { TextMessageView } from './text-message-view'
import { MessageWithMetadata } from '../../../core/chat'

export interface MessageViewProps extends ViewProps {
  message: ChatMessage
  status: MessageWithMetadata['status']
}

export const MessageView: React.FC<MessageViewProps> = memo(
  ({ children, message, ...restProps }) => {
    return isTextMessage(message) ? (
      <TextMessageView message={message} {...restProps}>
        {children}
      </TextMessageView>
    ) : isStreamTextMessage(message) ? (
      <StreamTextMessageView message={message} {...restProps}>
        {children}
      </StreamTextMessageView>
    ) : null
  }
)

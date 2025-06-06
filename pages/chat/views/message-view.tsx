import {
  ChatMessage,
  isStreamTextMessage,
  isTextMessage,
  StreamTextMessage,
  TextMessage,
} from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Text, View, ViewProps } from 'react-native'
import { StreamTextMessageView } from './steram-text-message-view'
import { TextMessageView } from './text-message-view'
import { MessageWithMetadata } from '../../../core/chat'

export interface MessageViewProps extends ViewProps {
  message: ChatMessage
  status: MessageWithMetadata['status']
}

export const MessageView: React.FC<MessageViewProps> = memo(
  ({ children, message, ...restProps }) => {
    return (
      <>
        {isTextMessage(message) ? (
          <TextMessageView message={message} {...restProps}>
            {children}
          </TextMessageView>
        ) : isStreamTextMessage(message) ? (
          <StreamTextMessageView message={message} {...restProps}>
            {children}
          </StreamTextMessageView>
        ) : null}

        {message.extra?.tool_call ? (
          <View className="p-4 bg-secondaryBackground rounded-lg">
            <Text className="font-bold mb-4 text-lg">
              {message.extra.tool_call.title}
            </Text>
            <Text>
              {JSON.stringify(message.extra.tool_call?.result ?? null)}
            </Text>
          </View>
        ) : null}
      </>
    )
  }
)

import {
  ChatMessage,
  isStreamTextMessage,
  isTextMessage,
  StreamTextMessage,
  TextMessage,
} from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { ScrollView, Text, View, ViewProps } from 'react-native'
import { StreamTextMessageView } from './stream-text-message-view'
import { TextMessageView } from './text-message-view'
import { MessageWithMetadata } from '../../../core/chat'

export interface MessageViewProps extends ViewProps {
  message: ChatMessage
  status: MessageWithMetadata['status']
}

export const MessageView: React.FC<MessageViewProps> = memo(
  ({ children, message, ...restProps }) => {
    return (
      <View className="mb-6">
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
          <View className="p-4 bg-cardBackground rounded-xl shadow-lg shadow-black/5 border-border border">
            <Text className="mb-4 text-lg text-tint">
              {message.extra.tool_call.title}
            </Text>
            <ScrollView className="bg-secondaryBackground p-2 max-h-[100] rounded-xl">
              <Text className="text-label font-mono tracking-wide leading-6">
                {JSON.stringify(
                  message.extra.tool_call?.result ?? null,
                  null,
                  2
                )}
              </Text>
            </ScrollView>
          </View>
        ) : null}
      </View>
    )
  }
)

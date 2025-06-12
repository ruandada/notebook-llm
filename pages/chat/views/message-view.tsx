import {
  ChatMessage,
  isErrorMessage,
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
import { ErrorMessageView } from './error-message-view'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useThemeColor } from '@/components/theme-provider'

export interface MessageViewProps extends ViewProps {
  message: ChatMessage
  status: MessageWithMetadata['status']
}

export const MessageView: React.FC<MessageViewProps> = memo(
  ({ children, message, ...restProps }) => {
    const secondaryLabelColor = useThemeColor('secondaryLabel')
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
        ) : isErrorMessage(message) ? (
          <ErrorMessageView message={message} {...restProps} />
        ) : null}

        {message.extra?.tool_call ? (
          <View className="flex flex-row items-center gap-2 h-[32] mt-1">
            <MaterialCommunityIcons
              name="function"
              size={24}
              color={secondaryLabelColor}
            />
            <Text className="text-lg text-secondaryLabel">
              {message.extra.tool_call.title}
            </Text>
          </View>
        ) : null}
      </View>
    )
  }
)

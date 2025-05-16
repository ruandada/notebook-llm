import { TextChatMessage } from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Text, View, ViewProps } from 'react-native'

export interface TextMessageViewProps extends ViewProps {
  message: TextChatMessage
}

export const TextMessageView: React.FC<TextMessageViewProps> = memo(
  ({ message, children, ...restProps }) => {
    return (
      <View {...restProps}>
        <Text>{message.content.text}</Text>
      </View>
    )
  }
)

import { TextMessage } from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Text, View, ViewProps } from 'react-native'

export interface TextMessageViewProps extends ViewProps {
  message: TextMessage
}

export const TextMessageView: React.FC<TextMessageViewProps> = memo(
  ({ message, children, ...restProps }) => {
    return (
      <View {...restProps}>
        <Text className="text-label leading-6 text-lg">
          {message.content.text}
        </Text>
      </View>
    )
  }
)

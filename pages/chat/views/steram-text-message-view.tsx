import { StreamTextMessage } from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Text, View, ViewProps } from 'react-native'

export interface StreamTextMessageViewProps extends ViewProps {
  message: StreamTextMessage
}

export const StreamTextMessageView: React.FC<StreamTextMessageViewProps> = memo(
  ({ message, children, ...restProps }) => {
    return (
      <View {...restProps}>
        <Text className="text-label">{message.content.buffer.join('')}</Text>
      </View>
    )
  }
)

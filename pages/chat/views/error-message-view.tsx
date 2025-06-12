import { ErrorMessage, TextMessage } from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Text, View, ViewProps } from 'react-native'

export interface ErrorMessageViewProps extends ViewProps {
  message: ErrorMessage
}

export const ErrorMessageView: React.FC<ErrorMessageViewProps> = memo(
  ({ message, children, ...restProps }) => {
    if (!message.content.reason) {
      return null
    }

    return (
      <View
        {...restProps}
        className="flex flex-row bg-cardBackground py-2 px-4 rounded-xl border border-border"
      >
        <View>
          <Text className="leading-8 text-lg text-destructive tracking-wide">
            {message.content.reason}
          </Text>
        </View>

        {children}
      </View>
    )
  }
)

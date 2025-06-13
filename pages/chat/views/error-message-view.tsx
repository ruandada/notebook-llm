import { ErrorMessage, TextMessage } from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Text, View, ViewProps } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useThemeColor } from '@/components/theme-provider'
import { MessageWithMetadata } from '@/core/chat'

export interface ErrorMessageViewProps extends ViewProps {
  message: MessageWithMetadata<ErrorMessage>
}

export const ErrorMessageView: React.FC<ErrorMessageViewProps> = memo(
  ({ message, children, ...restProps }) => {
    const descructiveColor = useThemeColor('destructive')

    return (
      <View
        {...restProps}
        className="flex flex-row items-center gap-2 bg-cardBackground py-2 px-4 rounded-xl border border-border"
      >
        <MaterialIcons name="error" size={18} color={descructiveColor} />
        <Text className="leading-8 text-lg text-destructive tracking-wide">
          {message.msg.content.reason ?? 'Unknown error'}
        </Text>

        {children}
      </View>
    )
  }
)

import { TextMessage } from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Text, View, ViewProps } from 'react-native'
import clsx from 'clsx'

export interface TextMessageViewProps extends ViewProps {
  message: TextMessage
}

export const TextMessageView: React.FC<TextMessageViewProps> = memo(
  ({ message, children, ...restProps }) => {
    const isUserMessage = message.role === 'user'

    if (!message.content.text) {
      return null
    }

    return (
      <View
        {...restProps}
        className={clsx(
          'flex flex-row',
          isUserMessage ? 'justify-end' : 'justify-start'
        )}
      >
        {isUserMessage ? (
          <View className="max-w-[80%] rounded-2xl px-4 py-3 bg-tint rounded-br-none">
            <Text className="leading-6 text-lg text-white">
              {message.content.text}
            </Text>
          </View>
        ) : (
          <View>
            <Text className="leading-8 text-lg text-label tracking-wide">
              {message.content.text}
            </Text>
          </View>
        )}

        {children}
      </View>
    )
  }
)

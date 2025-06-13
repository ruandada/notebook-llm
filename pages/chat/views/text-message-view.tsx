import { TextMessage } from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Pressable, Text, View, ViewProps } from 'react-native'
import clsx from 'clsx'
import { ChatMessageContextMenu } from './chat-message-context-menu'
import { MessageWithMetadata } from '@/core/chat'

export interface TextMessageViewProps extends ViewProps {
  message: MessageWithMetadata<TextMessage>
}

export const TextMessageView: React.FC<TextMessageViewProps> = memo(
  ({ message, children, ...restProps }) => {
    const isUserMessage = message.msg.role === 'user'

    if (!message.msg.content.text) {
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
          <View className="max-w-[80%]">
            <ChatMessageContextMenu
              message={message}
              disabled={message.stage !== 'history'}
            >
              <Pressable className="rounded-2xl px-4 py-3 bg-tint rounded-br-none">
                <Text className="leading-6 text-lg text-white">
                  {message.msg.content.text}
                </Text>
              </Pressable>
            </ChatMessageContextMenu>
          </View>
        ) : (
          <View>
            <Text className="leading-8 text-lg text-label tracking-wide">
              {message.msg.content.text}
            </Text>
          </View>
        )}

        {children}
      </View>
    )
  }
)

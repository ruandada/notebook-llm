import { StreamTextMessage } from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Text, View, ViewProps } from 'react-native'
import clsx from 'clsx'
import { MessageWithMetadata } from '@/core/chat'

export interface StreamTextMessageViewProps extends ViewProps {
  message: MessageWithMetadata<StreamTextMessage>
}

export const StreamTextMessageView: React.FC<StreamTextMessageViewProps> = memo(
  ({ message, children, ...restProps }) => {
    return (
      <View
        {...restProps}
        className={clsx(
          'flex flex-row',
          'justify-start' // stream message 通常是 assistant 角色
        )}
      >
        <View>
          <Text className="text-label text-lg leading-8 tracking-wide">
            {message.msg.content.buffer.join('')}
            <Text className="text-tint ml-2">▋</Text>
          </Text>
        </View>

        {children}
      </View>
    )
  }
)

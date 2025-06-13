import {
  ChatMessage,
  isErrorMessage,
  isStreamTextMessage,
  isTextMessage,
  StreamTextMessage,
  TextMessage,
} from '@/dao/chat-message.type'
import React, { memo } from 'react'
import { Pressable, ScrollView, Text, View, ViewProps } from 'react-native'
import { StreamTextMessageView } from './stream-text-message-view'
import { TextMessageView } from './text-message-view'
import { MessageWithMetadata } from '../../../core/chat'
import { ErrorMessageView } from './error-message-view'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useThemeColor } from '@/components/theme-provider'
import { AgentAvatar } from './agent-avatar'
import { Agent } from '@/dao/agent'
import { ChatMessageContextMenu } from './chat-message-context-menu'

export interface MessageViewProps extends ViewProps {
  message: ChatMessage
  agent: Agent
  status: MessageWithMetadata['status']
}

export const MessageView: React.FC<MessageViewProps> = memo(
  ({ children, agent, message, status, ...restProps }) => {
    const secondaryLabelColor = useThemeColor('secondaryLabel')

    const viewUI = (
      <>
        {isTextMessage(message) ? (
          <TextMessageView message={message} status={status} {...restProps}>
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
      </>
    )

    if (message.role === 'assistant') {
      return (
        <ChatMessageContextMenu message={message} status={status}>
          <Pressable className="px-4 py-3 flex flex-row items-start gap-4">
            <View className="mt-1">
              <AgentAvatar agent={agent} size={32} />
            </View>

            <View className="flex-1">{viewUI}</View>
          </Pressable>
        </ChatMessageContextMenu>
      )
    }

    return (
      <View className="px-4 py-3 flex flex-row items-start gap-4">
        <View className="flex-1">{viewUI}</View>
      </View>
    )
  }
)

import {
  ChatMessage,
  ErrorMessage,
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
import { MessageController } from '@/core/chat/message-controller'

export interface MessageViewProps extends ViewProps {
  message: MessageWithMetadata
  agent: Agent
  controller: MessageController
}

export const MessageView: React.FC<MessageViewProps> = memo(
  ({ children, controller, agent, message, ...restProps }) => {
    const secondaryLabelColor = useThemeColor('secondaryLabel')

    const contentView = (
      <>
        {isTextMessage(message.msg) ? (
          <TextMessageView
            message={message as MessageWithMetadata<TextMessage>}
            controller={controller}
            {...restProps}
          >
            {children}
          </TextMessageView>
        ) : isStreamTextMessage(message.msg) ? (
          <StreamTextMessageView
            message={message as MessageWithMetadata<StreamTextMessage>}
            {...restProps}
          >
            {children}
          </StreamTextMessageView>
        ) : isErrorMessage(message.msg) ? (
          <ErrorMessageView
            message={message as MessageWithMetadata<ErrorMessage>}
            {...restProps}
          />
        ) : null}

        {message.msg.extra?.tool_call ? (
          <View className="flex flex-row items-center gap-2 h-[32] mt-1">
            <MaterialCommunityIcons
              name="function"
              size={24}
              color={secondaryLabelColor}
            />
            <Text className="text-lg text-secondaryLabel">
              {message.msg.extra.tool_call.title}
            </Text>
          </View>
        ) : null}
      </>
    )

    if (message.msg.role === 'assistant') {
      return (
        <ChatMessageContextMenu
          message={message}
          disabled={message.stage !== 'history'}
          controller={controller}
        >
          <Pressable className="px-4 py-3 flex flex-row items-start gap-4">
            <View className="mt-1">
              <AgentAvatar agent={agent} size={32} />
            </View>

            <View className="flex-1">{contentView}</View>
          </Pressable>
        </ChatMessageContextMenu>
      )
    }

    return (
      <View className="px-4 py-3 flex flex-row items-start gap-4">
        <View className="flex-1">{contentView}</View>
      </View>
    )
  }
)

import React, { memo, useCallback, useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import dayjs from 'dayjs'
import { useMessageController } from '@/core/chat'
import { buildTextMessage } from '@/dao/chat-message.type'
import { MessageView } from './views'
import { useRequest } from '@/hooks/use-request'
import { useInstance } from '@/core/di'
import { ChatModel } from '@/dao/chat'
import { useScreenOptions } from '@/hooks/use-set-screen-options'
import { getChatTitle } from '@/dao/chat.type'
import { useKeyboardHeight } from '@/hooks/use-keyboard-height'
import Animated, { withTiming } from 'react-native-reanimated'
import { useAnimatedValue } from '@/hooks/use-animated-value'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

export interface ChatViewProps {
  chatId: string
}

export const ChatView: React.FC<ChatViewProps> = memo(({ chatId }) => {
  const { t } = useTranslation()
  const insects = useSafeAreaInsets()
  const [input, setInput] = useState('')

  const { controller, chatMessages } = useMessageController(chatId)
  const chatModel = useInstance(ChatModel)
  const keyboardHeight = useKeyboardHeight()
  const animatedKeyboardHeight = useAnimatedValue(
    keyboardHeight + (keyboardHeight > 0 ? -insects.bottom : 0)
  )

  const onSend = useCallback(() => {
    controller.appendUserMessage(buildTextMessage(chatId, input, 'user'))
    setInput('')
  }, [input])

  const { run: fetchChat, data: chat } = useRequest(
    {
      runner: () => chatModel.getChatById(chatId),
    },
    []
  )

  useEffect(() => {
    fetchChat()
  }, [])

  useScreenOptions(
    {
      title: chat ? getChatTitle(chat) : '',
    },
    [chat]
  )

  const revertedMessages = useMemo(() => {
    return chatMessages.slice().reverse()
  }, [chatMessages])

  // 预计算需要显示时间戳的消息ID和对应的时间戳字符串
  const timestampMap = useMemo(() => {
    const map = new Map<string, string>()
    let lastTimestampTime: dayjs.Dayjs | null = null

    if (chatMessages.length > 0) {
      // 始终显示第一条消息的时间戳
      map.set(chatMessages[0].msg.id, dayjs(chatMessages[0].msg.time).fromNow())
      lastTimestampTime = dayjs(chatMessages[0].msg.time)

      // 检查其他消息
      for (let i = 1; i < chatMessages.length; i++) {
        const currentTime = dayjs(chatMessages[i].msg.time)

        // 如果与上一个显示时间戳的消息时间差超过30分钟，显示时间戳
        if (
          lastTimestampTime &&
          currentTime.diff(lastTimestampTime, 'minute') >= 30
        ) {
          map.set(
            chatMessages[i].msg.id,
            dayjs(chatMessages[i].msg.time).fromNow()
          )
          lastTimestampTime = currentTime
        }
      }
    }

    return map
  }, [chatMessages])

  // 判断是否应该显示时间戳的函数
  const shouldShowTimestamp = useCallback(
    (messageId: string) => {
      return timestampMap.has(messageId)
    },
    [timestampMap]
  )

  return (
    <>
      <View className="h-[100vh] bg-secondaryBackground">
        <FlatList
          inverted
          data={revertedMessages}
          keyExtractor={(item) => item.msg.id}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-end',
          }}
          onScroll={() => {
            if (Keyboard.isVisible()) {
              Keyboard.dismiss()
            }
          }}
          renderItem={({ item }) => (
            <View className="px-4">
              {shouldShowTimestamp(item.msg.id) && (
                <Text className="text-secondaryLabel text-lg text-center py-2">
                  {timestampMap.get(item.msg.id)}
                </Text>
              )}
              <MessageView message={item.msg} status={item.status} />
            </View>
          )}
          ListHeaderComponent={() => (
            <Animated.View
              className="mb-[30vh]"
              style={{
                paddingBottom: animatedKeyboardHeight,
              }}
            ></Animated.View>
          )}
        ></FlatList>
      </View>

      <View className="absolute bottom-[-100] pb-[100] left-0 right-0 rounded-3xl shadow-md shadow-black/10 border border-border border-solid bg-background">
        <View
          className="w-full h-full"
          style={{
            paddingBottom: insects.bottom,
            paddingLeft: insects.left,
            paddingRight: insects.right,
          }}
        >
          <View className="mx-4 my-2 flex-column gap-2 items-stretch">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t('chat.user_message_placeholder')}
              className="text-label h-12 py-1 leading-[1.16] text-xl"
              onSubmitEditing={onSend}
              multiline={false}
              returnKeyType="send"
              enablesReturnKeyAutomatically
            />
            <View className="flex-row gap-2 items-center justify-end pb-1">
              <Pressable disabled={!input} onPress={onSend}>
                <View
                  className={clsx(
                    'w-10 h-10 bg-tint rounded-full flex items-center justify-center',
                    {
                      'opacity-50': !input,
                    }
                  )}
                >
                  <FontAwesome name="send" size={18} color="white" />
                </View>
              </Pressable>
            </View>
          </View>
          <Animated.View
            style={{
              height: animatedKeyboardHeight,
            }}
          ></Animated.View>
        </View>
      </View>
    </>
  )
})

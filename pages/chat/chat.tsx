import React, { memo, useCallback, useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
  ActivityIndicator,
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
import AntDesign from '@expo/vector-icons/AntDesign'
import { useThemeColor } from '@/components/theme-provider'
import { formatRelativeTime } from '@/core/utils/date'

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

  // 预计算需要显示时间戳的消息ID和对应的时间戳字符串
  const timestampMap = useMemo(() => {
    const result = new Map<string, string>()
    let lastTimestampTime: dayjs.Dayjs | null = null

    if (chatMessages.length > 0) {
      for (let i = chatMessages.length - 1; i >= 0; i--) {
        const msg = chatMessages[i]
        if (i === chatMessages.length - 1) {
          result.set(msg.msg.id, formatRelativeTime(msg.msg.time))
          lastTimestampTime = dayjs(chatMessages[0].msg.time)
          continue
        }

        const currentTime = dayjs(msg.msg.time)
        if (
          lastTimestampTime &&
          currentTime.diff(lastTimestampTime, 'minute') >= 30
        ) {
          result.set(msg.msg.id, formatRelativeTime(msg.msg.time))
          lastTimestampTime = currentTime
        }
      }
    }

    return result
  }, [chatMessages])

  const { run: loadMore, loading: isLoadingMore } = useRequest(
    {
      runner: () => controller.loadMore(),
    },
    []
  )

  const handleReachEnd = useCallback(() => {
    if (!controller.hasMore()) {
      return
    }

    loadMore()
  }, [loadMore])

  const secondaryLabelColor = useThemeColor('secondaryLabel')
  const secondaryBackgroundColor = useThemeColor('secondaryBackground')

  return (
    <>
      <View className="h-[100vh] bg-secondaryBackground">
        <FlatList
          inverted
          data={chatMessages}
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
          onEndReached={handleReachEnd}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() =>
            controller.hasMore() ? (
              <View className="h-20 flex items-center gap-2 justify-center mt-2 mb-6">
                {isLoadingMore ? (
                  <ActivityIndicator color="#999" />
                ) : chatMessages.length > 0 ? (
                  <>
                    <AntDesign
                      name="arrowup"
                      size={24}
                      color={secondaryLabelColor}
                    />
                    <Text className="text-secondaryLabel text-sm">
                      {t('chat.load_more')}
                    </Text>
                  </>
                ) : null}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <>
              <MessageView
                agent={controller.getAgent().getOptions()}
                message={item}
              />

              {timestampMap.has(item.msg.id) && (
                <Text className="text-secondaryLabel text-md text-center my-4">
                  {timestampMap.get(item.msg.id)}
                </Text>
              )}
            </>
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

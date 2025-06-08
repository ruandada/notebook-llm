import { useHeaderHeight } from '@react-navigation/elements'
import React, {
  memo,
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react'
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Button,
  FlatList,
  Pressable,
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

  return (
    <>
      <View className="h-[100vh] bg-secondaryBackground">
        <FlatList
          inverted
          data={revertedMessages}
          keyExtractor={(item) => item.msg.id}
          renderItem={({ item }) => (
            <View className="p-4">
              <Text className="text-secondaryLabel">
                {dayjs(item.msg.time).format('YYYY-MM-DD HH:mm:ss')}
              </Text>
              <MessageView message={item.msg} status={item.status} />
            </View>
          )}
          ListHeaderComponent={() => (
            <Animated.View
              style={{
                marginBottom: 300,
                paddingBottom: animatedKeyboardHeight,
              }}
            ></Animated.View>
          )}
        ></FlatList>
      </View>

      <View className="absolute bottom-[-1] left-0 right-0 rounded-3xl overflow-hidden border border-secondaryBorder border-solid">
        <View
          className="w-full h-full bg-background"
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

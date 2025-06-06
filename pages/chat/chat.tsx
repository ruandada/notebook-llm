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
import { BlurView } from 'expo-blur'
import { useTranslation } from 'react-i18next'

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
  const animatedKeyboardHeight = useAnimatedValue(keyboardHeight)

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
      <View className="h-[100vh]">
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

      <View className="absolute bottom-0 left-0 right-0 rounded-tr-2xl rounded-tl-2xl bg-cardHoverBackground/50 overflow-hidden">
        <BlurView
          intensity={100}
          experimentalBlurMethod="dimezisBlurView"
          className="w-full h-full"
          style={{
            paddingBottom: insects.bottom,
            paddingLeft: insects.left,
            paddingRight: insects.right,
          }}
        >
          <View className="m-4 px-4 rounded-lg flex-row gap-4 items-center">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t('chat.user_message_placeholder')}
              className="text-label flex-1 h-12 py-1 leading-[1.16] text-xl"
            />
            <Button title="Send" disabled={!input} onPress={onSend}></Button>
          </View>
        </BlurView>
        <Animated.View
          style={{
            height: animatedKeyboardHeight,
          }}
        ></Animated.View>
      </View>
    </>
  )
})

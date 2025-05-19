import { useHeaderHeight } from '@react-navigation/elements'
import React, { memo, useCallback, useEffect, useState } from 'react'
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

export interface ChatViewProps {
  chatId: string
}

export const ChatView: React.FC<ChatViewProps> = memo(({ chatId }) => {
  const insects = useSafeAreaInsets()
  const [input, setInput] = useState('')

  const { controller, chatMessages } = useMessageController(chatId)
  const chatModel = useInstance(ChatModel)
  const headerHeight = useHeaderHeight()

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

  return (
    <>
      <KeyboardAvoidingView behavior="padding">
        <View className="h-[100vh]">
          <FlatList
            data={chatMessages}
            keyExtractor={(item) => item.msg.id}
            style={{ paddingTop: headerHeight }}
            renderItem={({ item }) => (
              <View className="p-4">
                <Text className="text-secondaryLabel">
                  {dayjs(item.msg.time).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
                <MessageView message={item.msg} status={item.status} />
              </View>
            )}
            ListFooterComponent={() => <View style={{ height: 100 }}></View>}
          ></FlatList>
        </View>
      </KeyboardAvoidingView>

      <KeyboardAvoidingView
        behavior="padding"
        className="absolute bottom-0 left-0 right-0"
        keyboardVerticalOffset={-insects.bottom}
      >
        <View
          style={{
            paddingBottom: insects.bottom,
            paddingLeft: insects.left,
            paddingRight: insects.right,
          }}
        >
          <View className="m-4 px-4 border border-border rounded-lg bg-cardBackground flex-row gap-4 items-center">
            <TextInput
              value={input}
              onChangeText={setInput}
              className="w-full h-14 text-lg flex-1 text-label"
            />
            <Button title="Send" disabled={!input} onPress={onSend}></Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  )
})

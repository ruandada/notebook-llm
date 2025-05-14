import { useInstance } from '@/core/di'
import { ChatMessage, ChatMessageModel } from '@/dao/chat-message'
import { useRequest } from '@/hooks/use-request'
import { useHeaderHeight } from '@react-navigation/elements'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
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
import { messageId } from '@/core/idgenerator'
import { useHistoryMessages } from './use-history-messages'
import { useMessageBuffer } from './use-message-buffer'

export const ChatTest: React.FC = memo(() => {
  const headerHeight = useHeaderHeight()
  const insects = useSafeAreaInsets()

  const [input, setInput] = useState('')

  const { historyMessages, appendMessages: appendHistoryMessages } =
    useHistoryMessages()

  const { messageBuffer, appendMessage: appendMessageBuffer } =
    useMessageBuffer({
      onSubmit: async (messages) => {
        await appendHistoryMessages(messages)
      },
    })

  const onSend = useCallback(() => {
    appendMessageBuffer({
      id: messageId(),
      time: new Date(),
      chatId: 'default',
      role: 'user',
      type: 'text',
      searchTerm: '',
      content: input,
      extra: null,
    })
    setInput('')
  }, [input])

  return (
    <>
      <FlatList
        style={{ paddingTop: headerHeight }}
        data={[...(historyMessages || []), ...messageBuffer]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-4">
            <Text className="text-secondaryLabel">
              {dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')}
            </Text>
            <Text className="text-label text-lg">{item.content}</Text>
          </View>
        )}
      ></FlatList>

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
          <View className="m-4 px-4 border border-border rounded-lg bg-background shadow-md shadow-neutral-200 flex-row gap-4 items-center">
            <TextInput
              value={input}
              onChangeText={setInput}
              className="w-full h-16 text-lg flex-1"
              placeholder="Your placeholder here..."
            />
            <Button title="Send" disabled={!input} onPress={onSend}></Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  )
})

import { useInstance } from '@/core/di'
import { ChatModel } from '@/dao/chat'
import { Chat } from '@/dao/chat.type'
import { useRequest } from '@/hooks/use-request'
import { useRouter } from 'expo-router'
import React, { memo, useEffect, useState } from 'react'
import { Alert, Button, Pressable, Text, View } from 'react-native'

const PAGE_SIZE = 20

export const ChatListView: React.FC = memo(() => {
  const chatModel = useInstance(ChatModel)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  const {
    run: fetchChatList,
    data: chats,
    setData,
  } = useRequest(
    {
      defaultData: () => [],
      runner: (): Promise<Chat[]> =>
        chatModel.getLatestChatList(offset, PAGE_SIZE),
      onSuccess: (data) => {
        setHasMore(data.length < PAGE_SIZE)
      },
    },
    [offset]
  )

  const { run: createAndEnterNewChat, loading: creating } = useRequest(
    {
      runner: (): Promise<Chat> => chatModel.creteEmptyChat(),
      onSuccess: (data) => {
        router.push(`/chat/${data.id}`)
        setData((prev) => [data, ...prev])
      },
      onError: (error) => {
        Alert.alert('创建失败', error.message)
      },
    },
    [setData]
  )

  useEffect(() => {
    fetchChatList()
  }, [offset])

  return (
    <View>
      <Button
        title="新建对话"
        onPress={createAndEnterNewChat}
        disabled={creating}
      />
      <View>
        {(chats || []).map((chat) => (
          <Pressable
            key={chat.id}
            className="p-2 active:bg-neutral-100"
            onPress={() => router.push(`/chat/${chat.id}`)}
          >
            <Text>{chat.id}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
})

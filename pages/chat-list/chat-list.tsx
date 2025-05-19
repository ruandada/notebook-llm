import { Avatar } from '@/components/avatar'
import { PrettyScrollView } from '@/components/pretty-scroll-view'
import { useInstance } from '@/core/di'
import { ChatCreatedEvent, useEventListener } from '@/core/eventbus'
import { ChatModel } from '@/dao/chat'
import { Chat, getChatTitle } from '@/dao/chat.type'
import { useRequest } from '@/hooks/use-request'
import dayjs from 'dayjs'
import { useRouter } from 'expo-router'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, Text, View } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo'
import { getColorValue, paletteColor } from '@/core/color'
import { ChatMessageModel } from '@/dao/chat-message'
import { getMessageTextContent } from '@/dao/chat-message.type'
import { useStore } from '@/core/store'
import { ConfigStore } from '@/store/config'

const PAGE_SIZE = 20

export const ChatListView: React.FC = memo(() => {
  const chatModel = useInstance(ChatModel)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()
  const { t } = useTranslation()

  const config = useStore(useInstance(ConfigStore))

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

  useEffect(() => {
    fetchChatList()
  }, [])

  useEventListener<ChatCreatedEvent>(
    'chat.created',
    useCallback((ev) => {
      setData((prev) => [ev.data.chat, ...prev])
      setOffset((n) => n + 1)
    }, [])
  )

  return (
    <PrettyScrollView
      header={() => (
        <View>
          <Text className="text-label text-4xl mt-4">{t('chat.list')}</Text>
        </View>
      )}
    >
      {({ onScroll, headerHeight }) => (
        <>
          {chats?.length ? (
            <FlatList
              style={{ paddingTop: headerHeight + 10 }}
              data={chats || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  key={item.id}
                  className="active:bg-cardHoverBackground mb-2 p-4"
                  onPress={() => router.push(`/chat/${item.id}`)}
                >
                  <View className="flex-row justify-between">
                    <View className="flex-row items-center gap-4 shrink">
                      <Avatar
                        fallback={
                          <Entypo
                            name="chat"
                            size={20}
                            color={getColorValue(paletteColor('violet', 900))}
                          />
                        }
                      />
                      <View className="flex-col gap-2">
                        <Text className="text-label text-xl">
                          {getChatTitle(item)}
                        </Text>

                        <Text
                          className="text-secondaryLabel text-md"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.extra?.last_message_text
                            ? [
                                item.extra.last_message_role === 'assistant'
                                  ? 'Bot'
                                  : config.user.nickname,
                                ': ',
                                item.extra.last_message_text,
                              ].join('')
                            : t('chat.default_description')}
                        </Text>
                      </View>
                    </View>

                    <View className="shrink-0">
                      <Text className="text-secondaryLabel text-md">
                        {dayjs(item.createTime).format('YYYY-MM-DD')}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
              onScroll={onScroll}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-secondaryLabel text-lg">暂无对话</Text>
            </View>
          )}
        </>
      )}
    </PrettyScrollView>
  )
})

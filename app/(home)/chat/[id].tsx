import { useScreenOptions } from '@/hooks/use-set-screen-options'
import { ChatView } from '@/pages/chat'
import { useLocalSearchParams } from 'expo-router'
import React, { memo } from 'react'

const ChatViewScreen: React.FC = memo(() => {
  const { id } = useLocalSearchParams()

  useScreenOptions({
    title: '对话详情',
    headerShown: true,
  })

  return <ChatView chatId={id as string} />
})

export default ChatViewScreen

import { ChatView } from '@/pages/chat'
import { useLocalSearchParams } from 'expo-router'
import React, { memo } from 'react'

const ChatViewScreen: React.FC = memo(() => {
  const { id } = useLocalSearchParams()

  return <ChatView chatId={id as string} />
})

export default ChatViewScreen

import { ChatView } from '@/pages/chat'
import { ChatMessageInspect } from '@/pages/chat-message-inspect'
import { useLocalSearchParams } from 'expo-router'
import React, { memo } from 'react'

const ChatMesageInspectScreen: React.FC = memo(() => {
  const { id } = useLocalSearchParams()

  return <ChatMessageInspect messageId={id as string} />
})

export default ChatMesageInspectScreen

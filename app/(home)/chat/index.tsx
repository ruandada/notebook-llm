import { useScreenOptions } from '@/hooks/use-set-screen-options'
import { ChatListView } from '@/pages/chat-list'
import React, { memo } from 'react'

const ChatListScreen: React.FC = memo(() => {
  useScreenOptions({
    title: '我的对话',
  })

  return <ChatListView />
})

export default ChatListScreen

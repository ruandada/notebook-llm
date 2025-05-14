import { useInstance } from '@/core/di'
import { ChatMessage, ChatMessageModel } from '@/dao/chat-message'
import { useRequest } from '@/hooks/use-request'
import { useCallback, useEffect } from 'react'

export const useHistoryMessages = () => {
  const chatMessageModel = useInstance(ChatMessageModel)

  const {
    data: historyMessages,
    setData: setHistoryMessages,
    run: fetchHistoryMessages,
  } = useRequest(
    {
      defaultData: () => [],
      runner: async (): Promise<ChatMessage[]> => {
        return chatMessageModel.getByChatId('default')
      },
    },
    []
  )

  useEffect(() => {
    fetchHistoryMessages()
  }, [])

  const appendMessages = useCallback((messages: ChatMessage[]) => {
    setHistoryMessages((prev) => [...prev, ...messages])
  }, [])

  return {
    historyMessages,
    appendMessages,
  }
}

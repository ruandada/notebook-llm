import { useFactoryRef } from '@/hooks/use-factroy-ref'
import { MessageController } from './message-controller'
import { useInstance } from '@/core/di'
import { useInitableInit } from '@/core/initable'
import { useStore } from '@/core/store'
import { useMemo } from 'react'
import { ChatMessageModel } from '@/dao/chat-message'
import { useOpenAI } from '../ai'
import { ChatModel } from '@/dao/chat'

export type { MessageWithMetadata } from './abstract'

export const useMessageController = (chatId: string) => {
  const chatModel = useInstance(ChatModel)
  const chatMessageModel = useInstance(ChatMessageModel)
  const openai = useOpenAI()

  const { current: controller } = useFactoryRef(
    () => new MessageController(chatId, chatModel, chatMessageModel, openai)
  )
  const [loaded, error] = useInitableInit(controller)

  const stores = controller.getStores()
  const historyMessages = useStore(stores.history)
  const justFinishedMessages = useStore(stores.justFinished)
  const processingMessages = useStore(stores.processing)

  return {
    controller,
    chatMessages: useMemo(
      () => [
        ...processingMessages,
        ...justFinishedMessages,
        ...historyMessages,
      ],
      [historyMessages, justFinishedMessages, processingMessages]
    ),
    loaded,
    error,
    processingMessageCount: useMemo(
      () => historyMessages.length + justFinishedMessages.length,
      [historyMessages, justFinishedMessages]
    ),
  }
}

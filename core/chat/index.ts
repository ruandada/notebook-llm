import { useFactoryRef } from '@/hooks/use-factroy-ref'
import { MessageController } from './message-controller'
import { useInjector, useInstance } from '@/core/di'
import { useInitableInit } from '@/core/initable'
import { useStore } from '@/core/store'
import { useMemo } from 'react'
import { ChatMessageModel } from '@/dao/chat-message'
import { useOpenAI } from '../ai'

export type { MessageWithMetadata } from './abstract'

export const useMessageController = (chatId: string) => {
  const chatMessageModel = useInstance(ChatMessageModel)
  const openai = useOpenAI()

  const { current: controller } = useFactoryRef(
    () => new MessageController(chatId, chatMessageModel, openai)
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
        ...historyMessages,
        ...justFinishedMessages,
        ...processingMessages,
      ],
      [historyMessages, justFinishedMessages, processingMessages]
    ),
    loaded,
    error,
  }
}

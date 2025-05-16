import { useFactoryRef } from '@/hooks/use-factroy-ref'
import { MessageController } from './message-controller'
import { useInjector } from '@/core/di'
import { useInitableInit } from '@/core/initable'
import { useStore } from '@/core/store'
import { useMemo } from 'react'

export type { MessageWithMetadata } from './abstract'

export const useMessageController = (chatId: string) => {
  const injector = useInjector()

  const { current: controller } = useFactoryRef(
    () => new MessageController(chatId, injector)
  )
  useInitableInit(controller)

  const historyMessages = useStore(controller.getHistoryMessageStore())
  const messageBuffer = useStore(controller.getMessageBufferStore())
  const flushingList = useStore(controller.getFlushingListStore())
  return {
    controller,
    chatMessages: useMemo(
      () => [...historyMessages, ...flushingList, ...messageBuffer],
      [historyMessages, flushingList, messageBuffer]
    ),
  }
}

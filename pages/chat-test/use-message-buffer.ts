import { useInstance } from '@/core/di'
import { createAsyncLock } from '@/core/utils'
import { ChatMessage, ChatMessageModel } from '@/dao/chat-message'
import { useRequest } from '@/hooks/use-request'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface MessageBufferOptions {
  onSubmit?: (messages: ChatMessage[]) => Promise<void>
}

interface MessageBufferItem {
  msg: ChatMessage
  status?: 'pending' | 'ready'
  backgroundTask?: (msg: ChatMessage) => Promise<void>
}

export const useMessageBuffer = (opt?: MessageBufferOptions) => {
  const [messageBuffer, setMessageBuffer] = useState<MessageBufferItem[]>([])
  const lock = useRef(createAsyncLock(1, 'latest'))

  const appendMessage = useCallback(
    (
      message: ChatMessage,
      backgroundTask?: MessageBufferItem['backgroundTask']
    ) => {
      setMessageBuffer((buf) => [
        ...buf,
        {
          msg: message,
          status: backgroundTask ? 'pending' : 'ready',
          backgroundTask,
        },
      ])
    },
    []
  )

  const clear = useCallback(() => {
    setMessageBuffer([])
  }, [])

  const chatMessageModel = useInstance(ChatMessageModel)
  const { run: saveMessages } = useRequest(
    {
      runner: async (msgs: ChatMessage[]): Promise<void> => {
        await chatMessageModel.insert(msgs)
      },
    },
    []
  )

  useEffect(() => {
    const readyItems: MessageBufferItem[] = []
    const restItems: MessageBufferItem[] = []

    for (const item of messageBuffer) {
      if (item.status === 'ready') {
        readyItems.push(item)
      } else {
        restItems.push(item)
      }
    }

    if (!readyItems.length) {
      return
    }

    ;(async () => {
      let unlock: () => void
      try {
        unlock = await lock.current()
      } catch {
        return
      }

      const payload = readyItems.map((item) => item.msg)
      await saveMessages(payload)
      if (opt?.onSubmit) {
        await opt.onSubmit(payload)
      }
      setMessageBuffer(restItems)

      unlock()
    })()
  }, [messageBuffer])

  return {
    messageBuffer: useMemo(
      () => messageBuffer.map((item) => item.msg),
      [messageBuffer]
    ),
    appendMessage,
    clear,
  }
}

import { useInstance } from '@/core/di'
import { createAsyncLock } from '@/core/utils'
import { ChatMessage, ChatMessageModel } from '@/dao/chat-message'
import { useRequest } from '@/hooks/use-request'
import { produce } from 'immer'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface MessageBufferOptions {
  onSubmit?: (messages: ChatMessage[]) => Promise<void>
}

export interface MessageBufferItem {
  msg: ChatMessage
  status?: 'initial' | 'ready' | 'running'
  backgroundTask?: (
    msg: ChatMessage,
    update: (by: (m: ChatMessage) => ChatMessage) => void
  ) => Promise<void>
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
          status: backgroundTask ? 'initial' : 'ready',
          backgroundTask,
        },
      ])
    },
    []
  )

  const chatMessageModel = useInstance(ChatMessageModel)
  const { run: saveMessages } = useRequest(
    {
      runner: async (msgs: ChatMessage[]): Promise<void> => {
        await chatMessageModel.insert(msgs)
      },
    },
    []
  )

  // 将已完成的消息，添加到数据库，并调用 onSubmit 回调
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

    lock.current
      .withLock(async () => {
        const payload = readyItems.map((item) => item.msg)
        await saveMessages(payload)
        if (opt?.onSubmit) {
          await opt.onSubmit(payload)
        }
        setMessageBuffer(restItems)
      })
      .catch(() => {})
  }, [messageBuffer])

  // 将正在运行的消息，设置为 running 状态，并执行 backgroundTask 回调
  useEffect(() => {
    const messageIdList = new Set<string>()
    for (const item of messageBuffer) {
      const id = item.msg.id
      if (item.status === 'initial') {
        messageIdList.add(id)

        if (item.backgroundTask) {
          const res = item.backgroundTask(item.msg, (by) => {
            setMessageBuffer((buf) =>
              buf.map((item) => {
                if (item.msg.id === id) {
                  return {
                    ...item,
                    msg: by(item.msg),
                  }
                }
                return item
              })
            )
          })

          Promise.resolve(res)
            .then(() => {
              // 如果执行成功，设置为 ready 状态
              setMessageBuffer((buf) =>
                buf.map((item) => {
                  if (item.msg.id === id) {
                    return { ...item, status: 'ready' }
                  }
                  return item
                })
              )
            })
            .catch((e: Error) => {
              console.log('执行失败', e.message)
              // 如果执行失败，去掉 message
              setMessageBuffer((buf) =>
                buf.filter((item) => item.msg.id !== id)
              )
            })
        }
      }
    }

    if (messageIdList.size) {
      setMessageBuffer((buf) =>
        buf.map((item) => {
          if (messageIdList.has(item.msg.id)) {
            return {
              ...item,
              status: item.backgroundTask ? 'running' : 'ready',
            }
          }
          return item
        })
      )
    }
  }, [messageBuffer])

  return {
    messageBuffer: useMemo(
      () =>
        messageBuffer
          .map((item) => item.msg)
          .sort((a, b) => a.time.valueOf() - b.time.valueOf()),
      [messageBuffer]
    ),
    appendMessage,
  }
}

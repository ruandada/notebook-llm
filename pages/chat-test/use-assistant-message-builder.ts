import { useOpenAI } from '@/core/ai'
import { messageId } from '@/core/idgenerator'
import { ChatMessage } from '@/dao/chat-message'
import { MessageBufferItem } from './use-message-buffer'
import { useCallback } from 'react'

export const useAssistantMessageBuilder = () => {
  const { openai, defaultModel } = useOpenAI()

  return useCallback(
    (userMessage: ChatMessage): MessageBufferItem => {
      return {
        msg: {
          id: messageId(),
          time: new Date(),
          chatId: 'default',
          role: 'assistant',
          type: 'text',
          searchTerm: '',
          content: '',
          extra: null,
        },
        backgroundTask: async (msg: ChatMessage, update): Promise<void> => {
          const stream = await openai.chat.completions.create({
            model: defaultModel,
            stream: true,
            messages: [
              {
                role: 'user',
                content: userMessage.content,
              },
            ],
          })

          for await (const event of stream) {
            const delta = event.choices[0]?.delta?.content
            if (delta) {
              update((m) => ({ ...m, content: m.content + delta }))
            }
          }
        },
      }
    },
    [openai, defaultModel]
  )
}

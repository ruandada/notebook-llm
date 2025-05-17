import { OpenAIContext } from '@/core/ai'
import { AsyncMessageBuilder } from './abstract'
import {
  buildStreamTextMessage,
  ChatMessage,
  StreamTextMessage,
  TextMessage,
} from '@/dao/chat-message.type'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import type { MessageController } from './message-controller'

export const openaiMessageBuilder = (
  context: OpenAIContext,
  historyMessages: ChatMessage[]
): AsyncMessageBuilder<StreamTextMessage> => {
  return {
    create: (chatId: string) => buildStreamTextMessage(chatId, 'assistant'),
    build: async (
      messageId: string,
      controller: MessageController
    ): Promise<void> => {
      const { openai } = context

      const stream = await openai.chat.completions.create({
        model: context.defaultModel,
        stream: true,
        messages: historyMessages
          .map((msg) => {
            if (msg.type === 'text') {
              return {
                role: msg.role,
                content: msg.content.text,
              }
            }

            if (msg.type === 'error') {
              return {
                role: msg.role,
                content: msg.content.message,
              }
            }

            return null!
          })
          .filter((msg) => !!msg) as ChatCompletionMessageParam[],
      })

      for await (const event of stream) {
        const delta = event.choices[0]?.delta?.content
        if (delta) {
          controller.updateBufferMessage<StreamTextMessage>(
            messageId,
            (msg) => {
              msg.content.buffer.push(delta)
            }
          )
        }
      }

      // 最后将流式消息转换为文本消息
      controller.updateBufferMessage<StreamTextMessage>(messageId, (msg) => {
        const textMsg: TextMessage = {
          ...msg,
          type: 'text',
          content: {
            text: msg.content.buffer.join(''),
          },
        }

        return textMsg as unknown as StreamTextMessage
      })
    },
  }
}

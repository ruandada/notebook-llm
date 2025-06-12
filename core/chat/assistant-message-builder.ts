import { OpenAIContext } from '@/core/ai'
import { AsyncMessageBuilder } from './abstract'
import {
  buildStreamTextMessage,
  ChatMessage,
  isErrorMessage,
  isTextMessage,
  StreamTextMessage,
  TextMessage,
} from '@/dao/chat-message.type'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import type { MessageController } from './message-controller'
import { produce } from 'immer'
import { AgentDriver } from './agent-driver'

export interface AssistantMessageBuilderOptions {
  context: OpenAIContext
  historyMessages: ChatMessage[]
  agent: AgentDriver
  maxRound?: number
}

export const assistantMessageBuilder = ({
  context,
  historyMessages,
  agent,
  maxRound = 10,
}: AssistantMessageBuilderOptions): AsyncMessageBuilder => {
  return {
    create: (chatId: string) => buildStreamTextMessage(chatId, 'assistant'),
    build: async (
      messageId: string,
      controller: MessageController
    ): Promise<void> => {
      const { openai } = context

      const openaiMessages: ChatCompletionMessageParam[] = [
        ...agent.getOpenAISystemPrompts(),
      ]

      historyMessages.forEach((msg) => {
        if (msg.role === 'assistant') {
          if (isTextMessage(msg) && msg.content.text) {
            openaiMessages.push({
              role: 'assistant',
              content: msg.content.text,
            })
          }

          if (isErrorMessage(msg) && msg.content.reason) {
            openaiMessages.push({
              role: 'assistant',
              content: `Error: ${msg.content.reason}`,
            })
          }

          // Push tool call and tool call result messages
          if (msg.extra?.tool_call?.result_status) {
            const {
              tool_call_id: toolCallId,
              tool_name: toolName,
              parameter,
              result,
            } = msg.extra.tool_call

            openaiMessages.push(
              {
                role: 'assistant',
                tool_calls: [
                  {
                    id: toolCallId,
                    type: 'function',
                    function: {
                      name: toolName,
                      arguments: parameter,
                    },
                  },
                ],
              },
              {
                role: 'tool',
                tool_call_id: toolCallId,
                content: JSON.stringify(result),
              }
            )
          }
        } else if (isTextMessage(msg) && msg.content.text) {
          openaiMessages.push({
            role: msg.role,
            content: msg.content.text,
          } as ChatCompletionMessageParam)
        }
      })

      const { modelOptions } = agent.getOptions()
      const tools = agent.getOpenAITools()

      const stream = await openai.chat.completions.create({
        ...modelOptions,
        model: modelOptions.model ?? context.defaultModel,
        stream: true,
        messages: openaiMessages,
        ...(tools.length ? { tools } : {}),
      })

      for await (const event of stream) {
        const choice = event.choices[0]
        if (!choice) {
          continue
        }
        const { delta } = choice
        if (!delta) {
          continue
        }

        if (delta.content) {
          const text = delta.content
          controller.updateProcessingMessage<StreamTextMessage>(
            messageId,
            (msg): StreamTextMessage => {
              return produce(msg, (draft) => {
                draft.content.buffer.push(text)
              })
            }
          )
        }

        if (delta.tool_calls?.length) {
          const toolCall = delta.tool_calls[0]

          if (toolCall?.function?.name) {
            const toolName = toolCall.function.name
            const tool = agent.getTool(toolName)
            if (!tool) {
              controller.updateProcessingMessage<StreamTextMessage>(
                messageId,
                (msg): StreamTextMessage => ({
                  ...msg,
                  extra: {
                    ...msg.extra,
                    tool_call: {
                      title: toolName,
                      tool_call_id: '',
                      tool_id: '',
                      tool_name: toolName,
                      parameter: '{}',
                      result: {
                        error: `tool ${toolName} not found`,
                      },
                      result_status: 'failed',
                    },
                  },
                })
              )
              continue
            }

            const parameter = toolCall.function.arguments || '{}'
            const toolCallId = toolCall.id
            controller.updateProcessingMessage<StreamTextMessage>(
              messageId,
              (msg): StreamTextMessage => ({
                ...msg,
                extra: {
                  ...msg.extra,
                  tool_call: {
                    title: tool.title || toolName,
                    tool_call_id: toolCallId ?? '',
                    tool_id: tool.id,
                    tool_name: toolName,
                    parameter,
                  },
                },
              })
            )

            agent
              .runTool(toolName, parameter)
              .then((result) => {
                controller.updateProcessingMessage<StreamTextMessage>(
                  messageId,
                  (msg): StreamTextMessage =>
                    produce(msg, (draft) => {
                      draft.extra.tool_call!.result = result
                      draft.extra.tool_call!.result_status = 'success'
                    })
                )
              })
              .catch((reason?: any) => {
                controller.updateProcessingMessage<StreamTextMessage>(
                  messageId,
                  (msg): StreamTextMessage =>
                    produce(msg, (draft) => {
                      draft.extra.tool_call!.result = {
                        error:
                          typeof reason === 'string'
                            ? reason
                            : reason instanceof Error
                            ? reason.message
                            : String(reason),
                      }
                      draft.extra.tool_call!.result_status = 'failed'
                    })
                )
              })
              .finally(() => {
                if (maxRound <= 0) {
                  return
                }
                const currentMessage =
                  controller.getProcessingMessageById(messageId)
                if (!currentMessage) {
                  return
                }

                controller.applyMessageBuilder(
                  assistantMessageBuilder({
                    context,
                    historyMessages: [...historyMessages, currentMessage.msg],
                    agent,
                    maxRound: Math.max(maxRound - 1, 0),
                  })
                )
              })
          }
        }
      }

      // 最后将流式消息转换为文本消息
      controller.updateProcessingMessage<StreamTextMessage>(
        messageId,
        (msg) => {
          const textMsg: TextMessage = {
            ...msg,
            type: 'text',
            content: {
              text: msg.content.buffer.join(''),
            },
          }

          return textMsg
        }
      )
    },
  }
}

import { OpenAIContext } from '@/core/ai'
import { Initable } from '@/core/initable'
import { Store } from '@/core/store'
import { createMemoryStore } from '@/core/store'
import { ChatMessageModel } from '@/dao/chat-message'
import {
  ChatMessage,
  getMessageTextContent,
  isEmptyMessage,
} from '@/dao/chat-message.type'
import { AsyncMessageBuilder, MessageWithMetadata } from './abstract'
import { assistantMessageBuilder } from './assistant-message-builder'
import { createAsyncLock } from '@/core/utils'
import { AsyncLock } from '../utils/schedule'
import { ChatModel } from '@/dao/chat'
import { AgentDriver } from './agent-driver'
import { getDefaultAgent } from '@/dao/agent'

export class MessageController implements Initable {
  protected readonly stages: {
    history: Store<MessageWithMetadata[]>
    justFinished: Store<MessageWithMetadata[]>
    processing: Store<MessageWithMetadata[]>
  }

  protected readonly locks: {
    justFinished: AsyncLock
  }

  protected readonly agent: AgentDriver

  constructor(
    protected readonly chatId: string,
    protected readonly chatModel: ChatModel,
    protected readonly chatMessageModel: ChatMessageModel,
    protected readonly openai: OpenAIContext
  ) {
    this.stages = {
      history: createMemoryStore<MessageWithMetadata[]>(() => []),
      justFinished: createMemoryStore<MessageWithMetadata[]>(() => []),
      processing: createMemoryStore<MessageWithMetadata[]>(() => []),
    }

    this.locks = {
      justFinished: createAsyncLock(1, 'latest'),
    }
    ;[this.onProcessingMessagesChange, this.onJustFinishedMessagesChange] = [
      this.onProcessingMessagesChange.bind(this),
      this.onJustFinishedMessagesChange.bind(this),
    ]
    this.agent = new AgentDriver(getDefaultAgent())
  }

  public getChatId(): string {
    return this.chatId
  }

  /**
   * Append a user message to the chat history and start a new assistant message building process automatically
   * @param msg - The user message to append
   */
  public async appendUserMessage(msg: ChatMessage) {
    this.stages.processing.update((buf) => [
      ...buf,
      {
        msg,
        status: 'finished',
      },
    ])

    const historyMessages = (this.stages.history.getValue() || [])
      .map((item) => item.msg)
      .reverse()
      .slice(0, this.agent.getOptions().maxLookupHistory)
      .reverse()

    const builder = assistantMessageBuilder({
      context: this.openai,
      agent: this.agent,
      historyMessages: [...historyMessages, msg],
    })

    this.applyMessageBuilder(builder)
  }

  /**
   * Apply a message builder to the chat history
   * @param builder - The message builder to apply
   */
  public applyMessageBuilder(builder: AsyncMessageBuilder): void {
    const msg = builder.create(this.chatId)
    this.stages.processing.update((buf) => [
      ...buf,
      {
        msg,
        status: 'building',
      },
    ])

    builder.build(msg.id, this).then(() => {
      this.stages.processing.update((buf) => {
        for (const item of buf) {
          if (item.msg.id === msg.id) {
            item.status = 'finished'
          }
        }
      })
    })
  }

  public updateProcessingMessage<M extends ChatMessage>(
    messageId: string,
    by: (msg: M) => ChatMessage
  ) {
    this.stages.processing.update((buf) => {
      for (const item of buf) {
        if (item.msg.id === messageId) {
          item.msg = by(item.msg as M)
        }
      }
    })
  }

  public getProcessingMessageById(
    messageId: string
  ): MessageWithMetadata | undefined {
    return this.stages.processing
      .getValue()
      .find((item) => item.msg.id === messageId)
  }

  public getStores(): typeof this.stages {
    return this.stages
  }

  async init(): Promise<void> {
    const messages = await this.chatMessageModel.getByChatId(this.chatId)

    this.stages.history.update(
      messages.map((msg) => ({
        msg,
        status: 'finished',
      }))
    )

    this.stages.processing.subscribe(this.onProcessingMessagesChange)
    this.stages.justFinished.subscribe(this.onJustFinishedMessagesChange)
  }

  async release(): Promise<void> {
    this.stages.processing.unsubscribe(this.onProcessingMessagesChange)
    this.stages.justFinished.unsubscribe(this.onJustFinishedMessagesChange)
  }

  private onProcessingMessagesChange(messages: MessageWithMetadata[]): void {
    const finishedMessages: MessageWithMetadata[] = []
    const restMessages: MessageWithMetadata[] = []

    for (const item of messages) {
      if (item.status === 'finished') {
        finishedMessages.push(item)
      } else {
        restMessages.push(item)
      }
    }

    if (finishedMessages.length > 0) {
      this.stages.justFinished.update((buf) => [...buf, ...finishedMessages])
      this.stages.processing.update(restMessages)
    }
  }

  private async onJustFinishedMessagesChange(
    messages: MessageWithMetadata[]
  ): Promise<void> {
    if (!messages.length) {
      return
    }

    await this.locks.justFinished.withLock(async (): Promise<void> => {
      const lastMessage = messages[messages.length - 1]

      await Promise.all([
        this.chatMessageModel.insert(messages.map((item) => item.msg)),
        this.chatModel.updateChatExtra(this.chatId, {
          last_message_role: lastMessage.msg.role,
          last_message_text: getMessageTextContent(lastMessage.msg).substring(
            0,
            100
          ),
        }),
      ])

      this.stages.history.update((buf) => [
        ...buf,
        ...messages.filter((msg) => !isEmptyMessage(msg.msg)),
      ])
      this.stages.justFinished.update([])
    })
  }
}

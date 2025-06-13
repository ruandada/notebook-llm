import { OpenAIContext } from '@/core/ai'
import { Initable } from '@/core/initable'
import { Store } from '@/core/store'
import { createMemoryStore } from '@/core/store'
import { ChatMessageModel } from '@/dao/chat-message'
import {
  buildErrorMessage,
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

const MESSAGE_BATCH_SIZE = 20

export class MessageController implements Initable {
  protected totalMessages: number = 0

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
      {
        msg,
        status: 'finished',
      },
      ...buf,
    ])

    const historyMessages = (this.stages.history.getValue() || [])
      .map((item) => item.msg)
      .slice(0, this.agent.getOptions().maxLookupHistory)
      .reverse()

    const builder = assistantMessageBuilder({
      context: this.openai,
      agent: this.agent,
      historyMessages: [...historyMessages, msg],
    })

    setTimeout(() => {
      this.applyMessageBuilder(builder)
    }, 100)
  }

  /**
   * Apply a message builder to the chat history
   * @param builder - The message builder to apply
   */
  public applyMessageBuilder(builder: AsyncMessageBuilder): void {
    const msg = builder.create(this.chatId)
    this.stages.processing.update((buf) => [
      {
        msg,
        status: 'building',
      },
      ...buf,
    ])

    builder
      .build(msg.id, this)
      .then(() => {
        this.stages.processing.update((buf) => {
          for (const item of buf) {
            if (item.msg.id === msg.id) {
              item.status = 'finished'
            }
          }
        })
      })
      .catch((e) => {
        this.stages.processing.update((buf) => {
          for (let i = 0; i < buf.length; i++) {
            if (buf[i].msg.id === msg.id) {
              buf[i] = {
                status: 'finished',
                msg: buildErrorMessage(
                  this.chatId,
                  (e instanceof Error ? e.message : String(e)) ??
                    'Unknown error'
                ),
              }
            }
          }
        })
      })
  }

  /**
   * Update a message in the processing stage
   * @param messageId - The id of the message to update
   * @param by - The function to update the message
   */
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

  /**
   * Get a message in the processing stage by id
   * @param messageId - The id of the message to get
   * @returns The message if found, otherwise undefined
   */
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

  public hasMore(): boolean {
    return this.totalMessages > this.stages.history.getValue().length
  }

  public getAgent(): AgentDriver {
    return this.agent
  }

  /**
   * Load more messages from the chat history (if there are more messages)
   */
  public async loadMore(): Promise<void> {
    const messages = await this.chatMessageModel.getByChatId(
      this.chatId,
      this.stages.history.getValue().length,
      MESSAGE_BATCH_SIZE
    )

    this.stages.history.update((buf) => [
      ...buf,
      ...messages.map((msg) => ({
        msg,
        status: 'finished',
      })),
    ])
  }

  /**
   * Initialize the message controller, and load the history messages
   */
  async init(): Promise<void> {
    const limit = Math.max(
      MESSAGE_BATCH_SIZE,
      this.agent.getOptions().maxLookupHistory
    )

    const [messages, totalMessages] = await Promise.all([
      this.chatMessageModel.getByChatId(this.chatId, 0, limit),
      this.chatMessageModel.countMessagesByChatId(this.chatId),
    ])

    this.totalMessages = totalMessages
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

  /**
   * Handle the change of processing messages, and push finished messages to the just finished stage
   * @param messages - The new processing messages
   */
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
      this.stages.justFinished.update((buf) => [...finishedMessages, ...buf])
      this.stages.processing.update(restMessages)
    }
  }

  /**
   * Handle the change of just finished messages, and push finished messages to the chat history
   * @param messages - The new just finished messages
   */
  private async onJustFinishedMessagesChange(
    messages: MessageWithMetadata[]
  ): Promise<void> {
    const newMessages = messages.filter((msg) => !isEmptyMessage(msg.msg))
    if (!newMessages.length) {
      this.stages.justFinished.update([])
      return
    }

    await this.locks.justFinished.withLock(async (): Promise<void> => {
      const lastMessage = newMessages[messages.length - 1]

      await Promise.all([
        this.chatMessageModel.insert(newMessages.map((item) => item.msg)),
        this.chatModel.updateChatExtra(this.chatId, {
          last_message_role: lastMessage.msg.role,
          last_message_text: getMessageTextContent(lastMessage.msg).substring(
            0,
            100
          ),
        }),
      ])

      this.totalMessages += newMessages.length
      this.stages.history.update((buf) => [...newMessages, ...buf])

      this.stages.justFinished.update([])
    })
  }
}

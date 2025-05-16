import { getOpenAIByInjector, OpenAIContext } from '@/core/ai'
import { Injector } from '@/core/di'
import { Initable } from '@/core/initable'
import { Store } from '@/core/store'
import { createMemoryStore } from '@/core/store'
import { ChatMessageModel } from '@/dao/chat-message'
import { ChatMessage } from '@/dao/chat-message.type'
import { AsyncMessageBuilder, MessageWithMetadata } from './abstract'
import { openaiMessageBuilder } from './openai-builder'
import { createAsyncLock } from '@/core/utils'
import { produce } from 'immer'

export class MessageController implements Initable {
  // 从数据中获取的，已保存的消息
  protected readonly historyMessages: Store<MessageWithMetadata[]>

  // 正在保存的消息
  protected readonly flushingList: Store<MessageWithMetadata[]>

  // 正在处理中的消息（还不能保存）
  protected readonly messageBuffer: Store<MessageWithMetadata[]>

  protected readonly chatMessageModel: ChatMessageModel

  protected readonly asyncLock: ReturnType<typeof createAsyncLock>

  protected readonly openai: OpenAIContext

  constructor(protected readonly chatId: string, injector: Injector) {
    this.historyMessages = createMemoryStore<MessageWithMetadata[]>(() => [])
    this.flushingList = createMemoryStore<MessageWithMetadata[]>(() => [])
    this.messageBuffer = createMemoryStore<MessageWithMetadata[]>(() => [])

    this.chatMessageModel = injector.getInstance(ChatMessageModel)!
    this.openai = getOpenAIByInjector(injector)

    this.handleMessageBufferChange = this.handleMessageBufferChange.bind(this)
    this.handleFlushingListChange = this.handleFlushingListChange.bind(this)
    this.asyncLock = createAsyncLock(1, 'latest')
  }

  async init(): Promise<void> {
    const messages = await this.chatMessageModel.getByChatId(this.chatId)

    this.historyMessages.update(
      messages.map((msg) => ({
        msg,
        status: 'finished',
      }))
    )

    this.messageBuffer.subscribe(this.handleMessageBufferChange)
    this.flushingList.subscribe(this.handleFlushingListChange)
  }

  async release(): Promise<void> {
    this.messageBuffer.unsubscribe(this.handleMessageBufferChange)
    this.flushingList.unsubscribe(this.handleFlushingListChange)
  }

  protected handleMessageBufferChange(
    messageBuffer: MessageWithMetadata[]
  ): void {
    const finishedMessages: MessageWithMetadata[] = []
    const restMessages: MessageWithMetadata[] = []

    for (const item of messageBuffer) {
      if (item.status === 'finished') {
        finishedMessages.push(item)
      } else {
        restMessages.push(item)
      }
    }

    if (finishedMessages.length > 0) {
      this.flushingList.update((buf) => [...buf, ...finishedMessages])
      this.messageBuffer.update(restMessages)
    }
  }

  protected async handleFlushingListChange(
    messages: MessageWithMetadata[]
  ): Promise<void> {
    if (!messages.length) {
      return
    }

    await this.asyncLock.withLock(async (): Promise<void> => {
      await this.chatMessageModel.insert(messages.map((item) => item.msg))

      this.historyMessages.update((buf) => [...buf, ...messages])
      this.flushingList.update([])
    })
  }

  protected applyMessageBuilder(builder: AsyncMessageBuilder<any>): void {
    const msg = builder.create(this.chatId)
    this.messageBuffer.update((buf) => [
      ...buf,
      {
        msg,
        status: 'building',
      },
    ])

    builder.build(msg.id, this).then(() => {
      this.messageBuffer.update((buf) => {
        for (const item of buf) {
          if (item.msg.id === msg.id) {
            item.status = 'finished'
          }
        }
      })
    })
  }

  public updateBufferMessage<M extends ChatMessage>(
    messageId: string,
    by: (msg: M) => void
  ) {
    this.messageBuffer.update((buf) => {
      for (const item of buf) {
        if (item.msg.id === messageId) {
          item.msg = produce(item.msg, by)
        }
      }
    })
  }

  public async appendUserMessage(msg: ChatMessage) {
    this.messageBuffer.update((buf) => [
      ...buf,
      {
        msg,
        status: 'finished',
      },
    ])

    const builder = openaiMessageBuilder(this.openai, [
      ...(this.historyMessages.getValue() || []).map((item) => item.msg),
      msg,
    ])

    this.applyMessageBuilder(builder)
  }

  public getHistoryMessageStore(): Store<MessageWithMetadata[]> {
    return this.historyMessages
  }

  public getMessageBufferStore(): Store<MessageWithMetadata[]> {
    return this.messageBuffer
  }

  public getFlushingListStore(): Store<MessageWithMetadata[]> {
    return this.flushingList
  }
}

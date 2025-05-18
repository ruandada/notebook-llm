import { OpenAIContext } from '@/core/ai'
import { Initable } from '@/core/initable'
import { Store } from '@/core/store'
import { createMemoryStore } from '@/core/store'
import { ChatMessageModel } from '@/dao/chat-message'
import { ChatMessage, isEmptyMessage } from '@/dao/chat-message.type'
import { AsyncMessageBuilder, MessageWithMetadata } from './abstract'
import { assistantMessageBuilder } from './assistant-message-builder'
import { createAsyncLock } from '@/core/utils'
import { ToolController } from './tool-controller'
import { getBuiltinTools } from './tool-builtin'

export class MessageController implements Initable {
  protected readonly store: {
    historyMessages: Store<MessageWithMetadata[]>
    doneMessages: Store<MessageWithMetadata[]>
    messageBuffer: Store<MessageWithMetadata[]>
  }

  protected readonly asyncLock: ReturnType<typeof createAsyncLock>

  protected readonly toolController: ToolController

  constructor(
    protected readonly chatId: string,
    protected readonly chatMessageModel: ChatMessageModel,
    protected readonly openai: OpenAIContext
  ) {
    this.store = {
      historyMessages: createMemoryStore<MessageWithMetadata[]>(() => []),
      doneMessages: createMemoryStore<MessageWithMetadata[]>(() => []),
      messageBuffer: createMemoryStore<MessageWithMetadata[]>(() => []),
    }
    ;[this.onMessageBufferChange, this.onDoneMessagesChange] = [
      this.onMessageBufferChange.bind(this),
      this.onDoneMessagesChange.bind(this),
    ]
    this.asyncLock = createAsyncLock(1, 'latest')
    this.toolController = new ToolController(getBuiltinTools())
  }

  public getChatId(): string {
    return this.chatId
  }

  public async appendUserMessage(msg: ChatMessage) {
    this.store.messageBuffer.update((buf) => [
      ...buf,
      {
        msg,
        status: 'finished',
      },
    ])

    const builder = assistantMessageBuilder({
      context: this.openai,
      historyMessages: [
        ...(this.store.historyMessages.getValue() || []).map(
          (item) => item.msg
        ),
        msg,
      ],
      tools: this.toolController,
    })

    this.applyMessageBuilder(builder)
  }

  public applyMessageBuilder(builder: AsyncMessageBuilder): void {
    const msg = builder.create(this.chatId)
    this.store.messageBuffer.update((buf) => [
      ...buf,
      {
        msg,
        status: 'building',
      },
    ])

    builder.build(msg.id, this).then(() => {
      this.store.messageBuffer.update((buf) => {
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
    by: (msg: M) => ChatMessage
  ) {
    this.store.messageBuffer.update((buf) => {
      for (const item of buf) {
        if (item.msg.id === messageId) {
          item.msg = by(item.msg as M)
        }
      }
    })
  }

  public getBufferMessageById(
    messageId: string
  ): MessageWithMetadata | undefined {
    return this.store.messageBuffer
      .getValue()
      .find((item) => item.msg.id === messageId)
  }

  public getHistoryMessageStore(): Store<MessageWithMetadata[]> {
    return this.store.historyMessages
  }

  public getMessageBufferStore(): Store<MessageWithMetadata[]> {
    return this.store.messageBuffer
  }

  public getDoneMessageStore(): Store<MessageWithMetadata[]> {
    return this.store.doneMessages
  }

  async init(): Promise<void> {
    const messages = await this.chatMessageModel.getByChatId(this.chatId)

    this.store.historyMessages.update(
      messages.map((msg) => ({
        msg,
        status: 'finished',
      }))
    )

    this.store.messageBuffer.subscribe(this.onMessageBufferChange)
    this.store.doneMessages.subscribe(this.onDoneMessagesChange)
  }

  async release(): Promise<void> {
    this.store.messageBuffer.unsubscribe(this.onMessageBufferChange)
    this.store.doneMessages.unsubscribe(this.onDoneMessagesChange)
  }

  private onMessageBufferChange(messageBuffer: MessageWithMetadata[]): void {
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
      this.store.doneMessages.update((buf) => [...buf, ...finishedMessages])
      this.store.messageBuffer.update(restMessages)
    }
  }

  private async onDoneMessagesChange(
    messages: MessageWithMetadata[]
  ): Promise<void> {
    if (!messages.length) {
      return
    }

    await this.asyncLock.withLock(async (): Promise<void> => {
      await this.chatMessageModel.insert(messages.map((item) => item.msg))

      this.store.historyMessages.update((buf) => [
        ...buf,
        ...messages.filter((msg) => !isEmptyMessage(msg.msg)),
      ])
      this.store.doneMessages.update([])
    })
  }
}

import { Injectable, Require } from '@/core/di'
import { Initable } from '@/core/initable'
import { ChatMessage } from './chat-message.type'
import { insert, N, sql, SQLiteStorage } from '@/core/sqlite'

@Injectable()
@Require(SQLiteStorage)
export class ChatMessageModel implements Initable {
  constructor(private readonly storage: SQLiteStorage) {}

  async init(): Promise<void> {
    await this.storage.execute(`
      CREATE TABLE IF NOT EXISTS "chat_message" (
        "id" TEXT NOT NULL,
        "chat_id" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "search_term" VARCHAR(8192),
        "content" TEXT,
        "time" INTEGER,
        "extra" TEXT,
        PRIMARY KEY ("id")
      );

      CREATE INDEX IF NOT EXISTS "idx_chat_id"
      ON "chat_message" (
        "chat_id"
      );

      CREATE INDEX IF NOT EXISTS "idx_role"
      ON "chat_message" (
        "role"
      );

      CREATE INDEX IF NOT EXISTS "idx_search_term"
      ON "chat_message" (
        "search_term"
      );

      CREATE INDEX IF NOT EXISTS "idx_type"
      ON "chat_message" (
        "type"
      );
    `)
  }

  async release(): Promise<void> {}

  async countMessagesByChatId(chatId: string): Promise<number> {
    const result = await this.storage.queryFirst<{ cnt: number }>(
      sql('SELECT COUNT(*) AS cnt FROM chat_message WHERE chat_id = ?', [
        chatId,
      ])
    )
    return result?.cnt ?? 0
  }

  async getByChatId(
    chatId: string,
    offset: number,
    limit: number
  ): Promise<ChatMessage[]> {
    const result = await this.storage.queryAll<ChatMessage>(
      sql(
        'SELECT * FROM chat_message WHERE chat_id = ? ORDER BY time DESC LIMIT ?, ?',
        [chatId, offset, limit]
      )
    )
    return result.map((item) => ChatMessageModel.deserialize(item))
  }

  async getByMessageId(messageId: string): Promise<ChatMessage | null> {
    const result = await this.storage.queryFirst<ChatMessage>(
      sql('SELECT * FROM chat_message WHERE id = ?', [messageId])
    )
    return result ? ChatMessageModel.deserialize(result) : null
  }

  async deleteMessages(messageIds: string[]): Promise<void> {
    await this.storage.run(
      sql(
        `DELETE FROM chat_message WHERE "id" IN (${N(messageIds.length)})`,
        messageIds
      )
    )
  }

  async insert(messages: ChatMessage[]): Promise<void> {
    await this.storage.run(
      insert(
        'chat_message',
        messages.map((msg) => ChatMessageModel.serialize(msg))
      )
    )
  }

  public static serialize(row: ChatMessage): Record<string, any> {
    return {
      id: row.id,
      time: row.time.valueOf(),
      chat_id: row.chatId,
      role: row.role,
      search_term: row.searchTerm || '',

      type: row.type,
      content: JSON.stringify(row.content),
      extra: row.extra ? JSON.stringify(row.extra) : '{}',
    }
  }

  public static deserialize(row: Record<string, any>): ChatMessage {
    const msg: ChatMessage = {
      id: row.id,
      time: new Date(row.time),
      chatId: row.chat_id,
      role: row.role,
      searchTerm: row.search_term || '',
      type: row.type,
      content: null!,
      extra: null!,
    }

    try {
      msg.content = JSON.parse(row.content)
    } catch (e) {
      msg.type = 'error'
      msg.content = {
        reason: `failed to parse content: ${row.content}`,
      }
    }

    try {
      msg.extra = row.extra ? JSON.parse(row.extra) : {}
    } catch (e) {
      msg.extra = {}
    }

    return msg
  }
}

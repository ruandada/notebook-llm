import { Injectable, Require } from '@/core/di'
import { inserts, ModelStorage, sql } from './base'
import { Initable } from '@/core/initable'

export interface ChatMessage {
  id: string
  time: Date
  chatId: string
  role: string
  type: string
  searchTerm: string
  content: string
  extra: {} | null
}

@Injectable()
@Require(ModelStorage)
export class ChatMessageModel implements Initable {
  constructor(private readonly storage: ModelStorage) {}

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

  async getByChatId(chatId: string): Promise<ChatMessage[]> {
    const result = await this.storage.queryAll<ChatMessage>(
      sql('SELECT * FROM chat_message WHERE chat_id = ? ORDER BY time ASC', [
        chatId,
      ])
    )
    return result.map((item) => this.unserialize(item))
  }

  async insert(messages: ChatMessage[]): Promise<void> {
    await this.storage.run(
      inserts(
        'chat_message',
        messages.map((msg) => this.serialize(msg))
      )
    )
  }

  protected serialize(row: ChatMessage): Record<string, any> {
    return {
      id: row.id,
      time: row.time.valueOf(),
      chat_id: row.chatId,
      role: row.role,
      type: row.type,
      search_term: row.searchTerm || '',
      content: row.content || '',
      extra: row.extra ? JSON.stringify(row.extra) : '',
    }
  }

  protected unserialize(row: Record<string, any>): ChatMessage {
    return {
      id: row.id,
      time: new Date(row.time),
      chatId: row.chat_id,
      role: row.role,
      type: row.type,
      searchTerm: row.search_term || '',
      content: row.content,
      extra: row.extra ? JSON.parse(row.extra) : null,
    }
  }
}

import { Injectable, Require } from '@/core/di'
import { inserts, ModelStorage, sql } from './base'
import { Initable } from '@/core/initable'
import { Chat } from './chat.type'
import { chatId } from '@/core/idgenerator'
import { SQLiteRunResult } from 'expo-sqlite'

@Injectable()
@Require(ModelStorage)
export class ChatModel implements Initable {
  constructor(private readonly storage: ModelStorage) {}

  async init(): Promise<void> {
    await this.storage.execute(`
      CREATE TABLE IF NOT EXISTS "chat" (
        "id" text(255) NOT NULL,
        "title" text(255) NOT NULL,
        "create_time" integer NOT NULL,
        "extra" text,
        "use_default_title" integer NOT NULL,
        PRIMARY KEY ("id")
      );

      CREATE INDEX IF NOT EXISTS "idx_create_time"
      ON "chat" (
        "create_time" DESC
      );

      CREATE INDEX IF NOT EXISTS "idx_title"
      ON "chat" (
        "title" ASC
      );

      CREATE INDEX IF NOT EXISTS "idx_use_default_title"
      ON "chat" (
        "use_default_title" ASC
      );
    `)
  }

  async release(): Promise<void> {}

  async getLatestChatList(offset: number, limit: number): Promise<Chat[]> {
    const stmt = sql(
      `SELECT * FROM "chat" ORDER BY "create_time" DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    )
    const res = await this.storage.queryAll<Chat>(stmt)
    return res.map((row) => ChatModel.deserialize(row))
  }

  async getChatById(id: string): Promise<Chat> {
    const stmt = sql(`SELECT * FROM "chat" WHERE "id" = ?`, [id])
    const res = await this.storage.queryAll<Chat>(stmt)
    if (!res?.length) {
      throw new Error(`chat ${id} not found`)
    }
    return ChatModel.deserialize(res[0])
  }

  async updateChatExtra(
    chatId: string,
    extra: Chat['extra']
  ): Promise<SQLiteRunResult> {
    return this.storage.run(
      sql('UPDATE "chat" SET "extra" = ? WHERE "id" = ?', [
        JSON.stringify(extra),
        chatId,
      ])
    )
  }

  async creteEmptyChat(): Promise<Chat> {
    const chat: Chat = {
      id: chatId(),
      createTime: new Date(),
      title: '',
      useDefaultTitle: true,
      extra: {},
    }
    await this.storage.run(inserts('chat', [ChatModel.serialize(chat)]))
    return chat
  }

  public static serialize(row: Chat): Record<string, any> {
    return {
      id: row.id,
      title: row.title,
      create_time: row.createTime.valueOf(),
      use_default_title: row.useDefaultTitle ? 1 : 0,
      extra: row.extra ? JSON.stringify(row.extra) : '{}',
    }
  }

  public static deserialize(row: Record<string, any>): Chat {
    const chat: Chat = {
      id: row.id,
      createTime: new Date(row.create_time),
      title: row.title ?? '',
      useDefaultTitle: !!row.use_default_title,
      extra: row.extra ?? '{}',
    }

    try {
      chat.extra = chat.extra ? JSON.parse(row.extra) : {}
    } catch (e) {
      chat.extra = {}
    }

    return chat
  }
}

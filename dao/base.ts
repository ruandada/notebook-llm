import * as SQLite from 'expo-sqlite'
import { Injectable } from '@/core/di'
import { Initable } from '@/core/initable'

export interface Statement {
  template: string
  params: SQLite.SQLiteBindParams
}

export const sql = (
  template: string,
  params: Record<string, any> | any[]
): Statement => ({
  template,
  params,
})

export const inserts = <T extends object>(tableName: string, rows: T[]) => {
  if (rows.length === 0) {
    throw new Error('rows is empty')
  }

  const columns = Object.keys(rows[0])
  const columnNames = columns.map((column) => `"${column}"`)
  const placholder = '(' + Array(columns.length).fill('?').join(', ') + ')'

  const values: any[] = []
  const placeholders: string[] = []
  for (const row of rows) {
    values.push(...columns.map((column) => row[column as keyof T]))
    placeholders.push(placholder)
  }

  return sql(
    `INSERT INTO "${tableName}" (${columnNames.join(
      ', '
    )}) VALUES ${placeholders.join(', ')}`,
    values
  )
}

@Injectable()
export class ModelStorage implements Initable {
  private db: SQLite.SQLiteDatabase = null!

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('notebook-llm.db')

    await this.db.execAsync('PRAGMA journal_mode = WAL;')
  }

  async release(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync()
    }
  }

  getEngine(): SQLite.SQLiteDatabase {
    return this.db
  }

  execute(sql: string): Promise<void> {
    return this.db.execAsync(sql)
  }

  run(stmt: Statement): Promise<SQLite.SQLiteRunResult> {
    return this.db.runAsync(stmt.template, stmt.params)
  }

  queryAll<T>(stmt: Statement): Promise<T[]> {
    return this.db.getAllAsync(stmt.template, stmt.params)
  }

  queryFirst<T>(stmt: Statement): Promise<T | null> {
    return this.db.getFirstAsync(stmt.template, stmt.params)
  }

  queryEach<T>(stmt: Statement): AsyncIterableIterator<T> {
    return this.db.getEachAsync<T>(stmt.template, stmt.params)
  }

  withTransaction(task: (tx: ModelStorage) => Promise<void>): Promise<void> {
    return this.db.withExclusiveTransactionAsync(async (tx) => {
      const storage = new ModelStorage()
      Object.assign(storage, {
        db: tx,
      })
      await task(storage)
    })
  }
}

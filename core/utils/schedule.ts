import { lockId } from '../idgenerator'

export interface AsyncLock {
  lock: () => Promise<() => void>
  withLock: <T>(fn: () => Promise<T>, throwError?: boolean) => Promise<T>
}

export const createAsyncLock = (
  queueLimit?: number,
  priority: 'earliest' | 'latest' = 'earliest'
): AsyncLock => {
  const queue: { resolve: () => void; reject: (reason?: any) => void }[] = []
  let locked = ''

  const createUnlocker = (id: string) => {
    return (): void => {
      if (locked !== id) {
        throw new Error('Not authorized to unlock')
      }
      locked = ''
      const next = priority === 'latest' ? queue.pop() : queue.shift()
      if (next) {
        next.resolve()
      }
    }
  }

  const lock = async (): Promise<() => void> => {
    if (locked) {
      await new Promise<void>((resolve, reject) => {
        if (typeof queueLimit === 'number' && queue.length >= queueLimit) {
          if (priority === 'latest') {
            const first = queue.shift()
            if (first) {
              first.reject('Queue limit is reached')
            }
            queue.push({ resolve, reject })
            return
          }

          reject('Queue limit is reached')
          return
        }
        queue.push({ resolve, reject })
      })
    }
    const id = lockId()
    locked = id
    return createUnlocker(id)
  }

  const withLock = async <T>(
    fn: () => Promise<T>,
    throwError?: boolean
  ): Promise<T> => {
    let unlock: () => void
    try {
      unlock = await lock()
    } catch (e) {
      if (throwError) {
        throw e
      }
      return null!
    }
    const res = await fn()
    unlock()
    return res
  }

  return {
    lock,
    withLock,
  }
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const withTimeout = <F extends (...args: any[]) => Promise<any>>(
  fn: F,
  timeout: number
): F => {
  return (async (...args: any[]): Promise<any> => {
    const [res, _] = await Promise.race([
      fn(...args),
      sleep(timeout).then(() => {
        throw new Error(`timeout ${timeout}ms exceeded`)
      }),
    ])
    return res
  }) as F
}

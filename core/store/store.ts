import { StorageProvider } from './abstract'
import { enableMapSet, produce, setAutoFreeze } from 'immer'
import debounce from 'lodash/debounce'
import { Initable } from '../initable'
import { AsyncLock, createAsyncLock } from '../utils/schedule'

export type Subscriber<T> = (newValue: T, oldValue: T) => void
export type Updater<T> = (value: T) => void

enableMapSet()
setAutoFreeze(false)
export class Store<T> implements Initable {
  protected value: T
  protected readonly subscribers: Set<Subscriber<T>>
  protected readonly lock: AsyncLock

  constructor(
    protected readonly provider: StorageProvider<T>,
    defaultData: () => T,
    flushInterval: number = 1000
  ) {
    this.value = defaultData()
    this.subscribers = new Set()
    this.flushAsync = debounce(
      this.flushAsync.bind(this),
      flushInterval
    ) as Store<T>['flushAsync']
    this.lock = createAsyncLock(0)
  }

  async init(): Promise<void> {
    const isPresent = await this.provider.isPresent()
    if (!isPresent) {
      return
    }
    this.value = await this.provider.load()
  }

  async release(): Promise<void> {
    await this.flushAsync()
  }

  getValue(): Readonly<T> {
    return this.value
  }

  async flushAsync(): Promise<void> {
    await this.lock.withLock(async (): Promise<void> => {
      await this.provider.save(this.value)
    })
  }

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber)

    return (): void => {
      this.subscribers.delete(subscriber)
    }
  }

  unsubscribe(subscriber: Subscriber<T>): void {
    this.subscribers.delete(subscriber)
  }

  update(): void
  update(by: T | Updater<T>): void
  update(...args: any[]): void {
    const oldValue: T = this.value
    let newValue: T

    if (args.length > 0) {
      const [by] = args
      if (typeof by === 'function') {
        newValue = produce(this.value, by)
      } else {
        newValue = by
      }
    } else {
      newValue = oldValue
    }

    this.value = newValue
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(newValue, oldValue)
      } catch (error) {
        console.error(error)
      }
    })

    try {
      this.flushAsync()
    } catch (err) {
      console.error(err)
    }
  }
}

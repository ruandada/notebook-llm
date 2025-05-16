import { StorageProvider } from './abstract'
import { Store } from './store'

export const createMemoryStorageProvider = <T>(): StorageProvider<T> => {
  let internalValue: T = null!

  return {
    save: async (data: T) => {
      internalValue = data
    },
    load: async (): Promise<T> => {
      return internalValue
    },
    isPresent: async (): Promise<boolean> => {
      return false
    },
  }
}

export const createMemoryStore = <T>(defaultValue: () => T): Store<T> => {
  return new Store(createMemoryStorageProvider(), defaultValue)
}

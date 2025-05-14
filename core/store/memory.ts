import { StorageProvider } from './abstract'

export const createMemoryStorageProvider = <T>(
  defaultValue: () => T
): StorageProvider<T> => {
  let internalValue: T = defaultValue()

  return {
    save: async (data: T) => {
      internalValue = data
    },
    load: async (): Promise<T> => {
      return internalValue
    },
    isPresent: async (): Promise<boolean> => {
      return true
    },
  }
}

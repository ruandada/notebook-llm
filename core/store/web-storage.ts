import { StorageProvider } from './abstract'
import JSYaml from 'js-yaml'

interface WebStorageProviderOptions {
  type?: 'local' | 'session'
  key: string
}

export const createWebStorageProvider = <T>(
  opt: WebStorageProviderOptions
): StorageProvider<T> => {
  const type = opt.type || 'session'
  const engine = type === 'local' ? self.localStorage : self.sessionStorage

  if (!engine) {
    throw new Error(`${type} storege is not present`)
  }
  return {
    save: async (data: T) => {
      engine.setItem(opt.key, JSYaml.dump(data))
    },
    load: async (): Promise<T> => {
      const data = engine.getItem(opt.key)

      if (!data) {
        return null!
      }

      return JSYaml.load(data) as T
    },
    isPresent: async (): Promise<boolean> => {
      return !!engine.getItem(opt.key)
    },
  }
}

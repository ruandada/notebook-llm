import * as FileSystem from 'expo-file-system'
import JSYaml from 'js-yaml'
import { StorageProvider } from './abstract'

interface FileSystemStorageProviderOptions {
  type?: 'document' | 'cache'
  filePath: string
}

export const createFileSystemStorageProvider = <T>(
  opt: FileSystemStorageProviderOptions
): StorageProvider<T> => {
  const type = opt.type || 'cache'
  const base =
    type === 'document'
      ? FileSystem.documentDirectory
      : FileSystem.cacheDirectory
  if (!base) {
    throw new Error(`${type} storege is not present`)
  }
  const uri = base + opt.filePath

  return {
    save: async (data: T) => {
      await FileSystem.writeAsStringAsync(uri, JSYaml.dump(data))
    },
    load: async (): Promise<T> => {
      const data = await FileSystem.readAsStringAsync(uri)
      return JSYaml.load(data) as T
    },
    isPresent: async (): Promise<boolean> => {
      const info = await FileSystem.getInfoAsync(uri)
      return !!info.exists
    },
  }
}

import { Injectable } from '../di'
import { Initable } from '../initable'
import * as FileSystem from 'expo-file-system'

export const clearFileSystem = async (): Promise<void> => {}

@Injectable()
export class FileSystemCleaner implements Initable {
  async init(): Promise<void> {
    if (!FileSystem.documentDirectory) {
      throw new Error('document storege is not present')
    }
    const files = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory
    )
    await Promise.all(
      files.map((file) =>
        FileSystem.deleteAsync(`${FileSystem.documentDirectory}/${file}`)
      )
    )
  }

  async release(): Promise<void> {}
}

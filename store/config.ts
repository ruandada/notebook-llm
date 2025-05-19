import { Injectable } from '@/core/di'
import { createFileSystemStorageProvider, Store } from '@/core/store'

export interface AppConfig {
  user: {
    username: string
    nickname: string
  }
  openai: {
    providers: Array<{
      name: string
      api_key: string
      base_url: string
      default_model: string
    }>
    default_provider: number
  }
}

@Injectable()
export class ConfigStore extends Store<AppConfig> {
  constructor() {
    super(
      createFileSystemStorageProvider<AppConfig>({
        type: 'document',
        filePath: 'app_config.yaml',
      }),
      () => ({
        user: {
          username: 'root',
          nickname: 'Admin',
        },
        openai: {
          providers: [
            {
              name: 'dashscope',
              api_key: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
              base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
              default_model: 'qwen-turbo',
            },
          ],
          default_provider: 0,
        },
      })
    )
  }
}

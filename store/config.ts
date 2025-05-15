import { Injectable } from '@/core/di'
import { createFileSystemStorageProvider, Store } from '@/core/store'

export interface AppConfig {
  models: Array<{
    name: string
    api_key: string
    base_url: string
    default_model: string
  }>
  active_model: number
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
        models: [
          {
            name: 'dashscope',
            api_key: 'sk-063eb8f1927c4bb4bd890b6cc4712770',
            base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            default_model: 'qwen-turbo',
          },
        ],
        active_model: 0,
      })
    )
  }
}

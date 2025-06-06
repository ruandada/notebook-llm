import { Injectable } from '@/core/di'
import {
  createFileSystemStorageProvider,
  createWebStorageProvider,
} from '@/core/store'
import { Store } from '@/core/store/store'
import { Platform } from 'react-native'

export interface AgentDefinition {
  id: string
  title: string
  description: string

  system_prompt: string
  model: string
  temperature: number
}

@Injectable()
export class AgentStore extends Store<AgentDefinition[]> {
  constructor() {
    super(
      Platform.select({
        ios: () =>
          createFileSystemStorageProvider<AgentDefinition[]>({
            type: 'document',
            filePath: 'agents.yaml',
          }),
        default: () =>
          createWebStorageProvider<AgentDefinition[]>({
            type: 'local',
            key: 'agents',
          }),
      })(),
      () => []
    )
  }
}

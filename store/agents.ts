import { Injectable } from '@/core/di'
import { createFileSystemStorageProvider } from '@/core/store/filesystem'
import { Store } from '@/core/store/store'

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
      createFileSystemStorageProvider({
        type: 'document',
        filePath: 'agents.yaml',
      }),
      []
    )
  }
}

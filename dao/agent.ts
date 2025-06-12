import type { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions'
import { Tool } from './tool.type'

export interface Agent {
  id: string
  systemPrompts: string[]
  maxLookupHistory: number
  tools: Tool[]
  useBuiltinTools: boolean
  modelOptions: Partial<ChatCompletionCreateParamsBase>
}

export const getDefaultAgent = (): Agent => {
  return {
    id: 'default',
    systemPrompts: [],
    maxLookupHistory: 10,
    useBuiltinTools: true,
    tools: [],
    modelOptions: {
      temperature: 0.2,
    },
  }
}

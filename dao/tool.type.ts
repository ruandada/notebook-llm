import { JSONSchemaType } from 'ajv'

export interface ToolBase {
  id: string
  name: string
  title: string
  description: string
  schema: JSONSchemaType<any>
  collectionId?: string
}

export interface BuiltinTool extends ToolBase {
  type: 'builtin'
  implemention: {
    run: (parameters: any) => Promise<any>
  }
}

export interface HttpTool extends ToolBase {
  type: 'http'
  implemention: {
    url: string
    method?: string
    headers?: Record<string, string>
  }
}

export type Tool = BuiltinTool | HttpTool

export const isBuiltinTool = (tool: Tool): tool is BuiltinTool => {
  return tool.type === 'builtin'
}

export const isHttpTool = (tool: Tool): tool is HttpTool => {
  return tool.type === 'http'
}

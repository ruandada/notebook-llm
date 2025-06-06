import { JSONSchemaType } from 'ajv'

export interface ToolBase<T = any> {
  id: string
  name: string
  title: string
  description: string
  schema: JSONSchemaType<T>
  collectionId?: string
}

export interface BuiltinTool<T = any> extends ToolBase<T> {
  type: 'builtin'
  implemention: {
    run: (parameters: T) => Promise<any>
  }
}

export interface HttpTool<T = any> extends ToolBase<T> {
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

export const buildBuiltinTool = <T>(
  name: string,
  title: string,
  description: string,
  schema: JSONSchemaType<T>,
  implemention: BuiltinTool['implemention']
): BuiltinTool<T> => {
  return {
    id: `builtin:${name}`,
    name,
    type: 'builtin',
    title: title,
    description: description,
    schema,
    implemention,
  }
}

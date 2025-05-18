import { HttpTool, isBuiltinTool, isHttpTool, Tool } from '@/dao/tool.type'
import { Ajv, ValidateFunction } from 'ajv'

import { fetch } from 'expo/fetch'
import type { ChatCompletionTool } from 'openai/resources/index.mjs'

export class ToolController {
  protected readonly ajv: Ajv

  protected readonly store: Map<string, Tool>
  protected validatorCache: Record<string, ValidateFunction<any>>

  constructor(tools: Tool[]) {
    this.ajv = new Ajv()
    this.store = new Map()
    this.validatorCache = {}
    tools.forEach((tool) => {
      this.register(tool)
    })
  }

  public register(tool: Tool): void {
    if (this.store.has(tool.name)) {
      throw new Error(`tool ${tool.name} has been registered`)
    }
    this.store.set(tool.name, tool)
  }

  public unregister(toolName: string): boolean {
    return this.store.delete(toolName)
  }

  public getTool(toolName: string): Tool | undefined {
    return this.store.get(toolName)
  }

  public getOpenAITools(): ChatCompletionTool[] {
    return Array.from(this.store.values()).map((tool) => {
      return {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.schema,
        },
      }
    })
  }

  public async run(toolName: string, parameter: string): Promise<any> {
    const tool = this.store.get(toolName)
    if (!tool) {
      throw new Error(`tool ${toolName} has not been registered`)
    }

    let input: Record<string, any>
    try {
      input = JSON.parse(parameter)
    } catch (e) {
      throw new Error(`parameter is not a valid json, ` + (e as Error).message)
    }

    let validator: ValidateFunction<any>
    if (!this.validatorCache[toolName]) {
      validator = this.ajv.compile(tool.schema)
      this.validatorCache[toolName] = validator
    } else {
      validator = this.validatorCache[toolName]
    }

    if (!validator(input)) {
      throw new Error(
        'parameter does not match the json schema: ' +
          JSON.stringify(validator.errors)
      )
    }

    if (isBuiltinTool(tool)) {
      return await tool.implemention.run(input)
    } else if (isHttpTool(tool)) {
      return await this.runHttpTool(tool, parameter)
    }
  }

  protected async runHttpTool(tool: HttpTool, parameter: string): Promise<any> {
    const { url, method, headers } = tool.implemention

    const res = await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf8',
        ...(headers ?? {}),
      },
      body: parameter,
    })

    return await res.json()
  }
}

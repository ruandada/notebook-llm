import { BuiltinTool } from '@/dao/tool.type'
import { factoryProvider, getInstance, Injector } from '../di'

const symbol = Symbol('builtin-tools')

Injector.$rootInjector.registerProvider(
  factoryProvider(
    symbol,
    (): BuiltinTool[] => {
      return [
        {
          id: 'builtin:get_current_time',
          name: 'get_current_time',
          type: 'builtin',
          title: '获取当前时间',
          description: '',
          schema: {
            type: 'object',
            properties: {},
            required: [],
          },
          implemention: {
            run: async () => {
              const now = new Date()
              return {
                timestamp: now.valueOf(),
                utc_format: now.toISOString(),
              }
            },
          },
        },
      ]
    },
    []
  )
)

export const getBuiltinTools = () => getInstance<BuiltinTool[]>(symbol)!

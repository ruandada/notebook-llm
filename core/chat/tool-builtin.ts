import { buildBuiltinTool, BuiltinTool } from '@/dao/tool.type'

const builtinTools: BuiltinTool[] = [
  buildBuiltinTool<{}>(
    'get_current_time',
    '获取当前时间',
    '',
    {
      type: 'object',
      properties: {},
      required: [],
    },
    {
      run: async () => {
        const now = new Date()
        return {
          timestamp: now.valueOf(),
          utc_format: now.toISOString(),
        }
      },
    }
  ),
]

export const getBuiltinTools = () => builtinTools

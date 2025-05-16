import { ConfigStore } from '@/store/config'
import { factoryProvider, Injector, useInstance } from './di'
import OpenAI from 'openai'
import { fetch } from 'expo/fetch'

const symbol = Symbol('openai')

export interface OpenAIContext {
  openai: OpenAI
  defaultModel: string
}

Injector.$rootInjector.registerProvider(
  factoryProvider<OpenAIContext>(
    symbol,
    (config: ConfigStore): OpenAIContext => {
      const { models, active_model } = config.getValue()
      const model = models[active_model]

      const compatibleFetch = (
        url: RequestInfo,
        init?: RequestInit
      ): Promise<Response> => {
        return fetch(
          typeof url === 'string' ? url : url.url,
          init
            ? {
                body: init.body || undefined,
                credentials: init.credentials || undefined,
                headers: init.headers || undefined,
                method: init.method || undefined,
                signal: init.signal || undefined,
              }
            : {}
        )
      }

      const openai = model
        ? new OpenAI({
            baseURL: model.base_url,
            apiKey: model.api_key,
            fetch: compatibleFetch,
          })
        : new OpenAI({
            fetch: compatibleFetch,
          })

      return {
        openai,
        defaultModel: model.default_model,
      }
    },
    [ConfigStore]
  )
)

export const useOpenAI = () => useInstance<OpenAIContext>(symbol)

export const getOpenAIByInjector = (injector: Injector): OpenAIContext =>
  injector.getInstance(symbol)!

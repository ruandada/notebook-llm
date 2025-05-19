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
      const {
        openai: { providers, default_provider: defaultProvider },
      } = config.getValue()
      const provider = providers[defaultProvider]

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

      const openai = provider
        ? new OpenAI({
            baseURL: provider.base_url,
            apiKey: provider.api_key,
            fetch: compatibleFetch,
          })
        : new OpenAI({
            fetch: compatibleFetch,
          })

      return {
        openai,
        defaultModel: provider.default_model,
      }
    },
    [ConfigStore]
  )
)

export const useOpenAI = () => useInstance<OpenAIContext>(symbol)

export const getOpenAIByInjector = (injector: Injector): OpenAIContext =>
  injector.getInstance(symbol)!

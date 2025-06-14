import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

export interface RequestOptions<Req extends any[], Res> {
  toastError?: boolean
  defaultData?: () => Awaited<Res>
  runner: (...req: Req) => Res | Promise<Awaited<Res>>
  onSuccess?: (data: Awaited<Res>, ...request: Req) => void
  onError?: (error: Error, ...request: Req) => void
  onBeforeRequest?: (...request: Req) => void | Promise<void>
}

export interface RequestContext<Req extends any[], Res> {
  run: (...request: Req) => Promise<Awaited<Res>>
  loading: boolean
  error: Error | null
  data: Awaited<Res> | null
  setData: React.Dispatch<React.SetStateAction<Res>>
}

export function useRequest<Req extends any[], Res>(
  opt: RequestOptions<Req, Res>,
  deps?: React.DependencyList
): RequestContext<Req, Res> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<Awaited<Res> | null>(
    opt.defaultData ? opt.defaultData() : null
  )
  const { t } = useTranslation()

  const run = useCallback<RequestContext<Req, Res>['run']>(
    async (...request: Req): Promise<Awaited<Res>> => {
      try {
        setLoading(true)
        setError(null)

        if (typeof opt.onBeforeRequest === 'function') {
          await opt.onBeforeRequest(...request)
        }

        const res = await opt.runner(...request)
        setData(res)
        opt.onSuccess?.(res, ...request)
        setLoading(false)
        return res
      } catch (err) {
        setError(err as Error)
        opt.onError?.(err as Error, ...request)
        if (opt.toastError !== false) {
          Alert.alert(t('request_failure'), (err as Error).message)
        }
        setLoading(false)
        throw err
      }
    },
    deps ?? [
      opt?.toastError !== false,
      opt.onBeforeRequest,
      opt.onError,
      opt.onSuccess,
      opt.runner,
    ]
  )

  return {
    run,
    data,
    setData: setData as React.Dispatch<React.SetStateAction<Res>>,
    error,
    loading,
  }
}

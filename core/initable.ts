import { useEffect, useState } from 'react'

export interface Initable {
  init(): Promise<void>
  release(): Promise<void>
}

export const compose = (
  mode: 'sequence' | 'parallel',
  ...initables: Initable[]
): Initable => {
  let flags: boolean[] = []

  if (mode === 'sequence') {
    return {
      async init() {
        flags = Array(initables.length).fill(false)
        for (const [i, initable] of initables.entries()) {
          await initable.init()
          flags[i] = true
        }
      },

      async release() {
        for (const [i, initable] of initables.entries()) {
          if (flags[i]) {
            await initable.release()
          }
        }
      },
    }
  } else if (mode === 'parallel') {
    return {
      async init() {
        flags = Array(initables.length).fill(false)
        await Promise.all(
          initables.map((initable, i) =>
            initable.init().then(() => {
              flags[i] = true
            })
          )
        )
      },

      async release() {
        await Promise.all(
          initables.map(async (initable, i): Promise<void> => {
            if (flags[i]) {
              await initable.release()
            }
          })
        )
      },
    }
  } else {
    throw new Error('Invalid compose mode')
  }
}

export function useInitableInit(
  ...initable: Initable[]
): [loaded: boolean, error: Error | null] {
  const n = initable.length
  const [loaded, setLoaded] = useState<Array<boolean>>(Array(n).fill(false))
  const [error, setError] = useState<Array<Error | null>>(Array(n).fill(null))

  useEffect(() => {
    const releaseCallbacks: (() => void)[] = []
    initable.forEach(async (initable, index) => {
      try {
        await initable.init()
        setLoaded(loaded.map((l, i) => (i === index ? true : l)))
        releaseCallbacks.push(async () => {
          await initable.release()
        })
      } catch (err) {
        setError(error.map((e, i) => (i === index ? (err as Error) : e)))
      }
    })

    return () => {
      releaseCallbacks.forEach(async (callback) => {
        try {
          await callback()
        } catch {}
      })
    }
  }, [])

  return [loaded.every((l) => l), error.find((e) => !!e) || null]
}

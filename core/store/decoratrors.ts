// eslint-disable-next-line import/no-extraneous-dependencies
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

import { Store } from './store'

type UnpackState<M> = M extends Store<infer S> ? S : never
type Selector<Snapshot, Selection> = (snapshot: Snapshot) => Selection
const defaultSelector = <S>(state: S): S => state

const shallowEquals = <Operand>(a: Operand, b: Operand): boolean => {
  if (typeof a !== typeof b) {
    return false
  }
  if (typeof a === 'number') {
    if (Number.isNaN(a)) {
      return Number.isNaN(b)
    }
    if (!Number.isFinite(a)) {
      return !Number.isFinite(b)
    }
    return a === b
  }

  if (typeof a !== 'object') {
    return a === b
  }

  const aKeys = Object.keys(a as any)
  const bKeys = Object.keys(b as any)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every((k) => (a as any)[k] === (b as any)[k])
}

export function useStore<S extends Store<any>, Selection = UnpackState<S>>(
  store: S,
  selector: Selector<Readonly<UnpackState<S>>, Selection> = defaultSelector
): Readonly<Selection> {
  const getSnapshot = (): Readonly<UnpackState<S>> => store.getValue()

  return useSyncExternalStoreWithSelector<Readonly<UnpackState<S>>, Selection>(
    (onStoreChange: () => void): (() => void) => {
      return store.subscribe(onStoreChange)
    },
    getSnapshot,
    getSnapshot,
    selector,
    shallowEquals
  )
}

export function quickSelector<S, P extends keyof S>(
  propNames: P[]
): Selector<S, { readonly [key in P]: S[key] }> {
  return (state: S) => {
    const selection: any = {}
    propNames.forEach((propName) => {
      selection[propName] = state[propName]
    })
    return selection as { readonly [key in P]: S[key] }
  }
}

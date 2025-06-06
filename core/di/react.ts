// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useContext } from 'react'

import { Injector } from './injector'
import { Token } from './type'

const InjectorContext = React.createContext<Injector>(Injector.$rootInjector)

export const InjectorProvider = InjectorContext.Provider

export function useInstance<T = any>(token: Token<T>, defaultValue: T): T
export function useInstance<T = any>(token: Token<T>): T
export function useInstance<T = any>(...args: any[]): T {
  const injector = useContext(InjectorContext)
  try {
    return injector.getInstance(args[0])!
  } catch (e) {
    if (args.length >= 2) {
      return args[1]
    }
    throw e
  }
}

export function useInjector(): Injector {
  return useContext(InjectorContext)
}

export function getInstance<T = any>(
  token: Token<T>,
  defaultValue: T,
  injector?: Injector
): T
export function getInstance<T = any>(token: Token<T>, injector?: Injector): T
export function getInstance<T = any>(...args: any[]): T {
  const customInjector =
    args.length > 1 && args[args.length - 1] instanceof Injector
      ? args[args.length - 1]
      : null
  const injector = customInjector ?? Injector.$rootInjector

  try {
    return injector.getInstance(args[0])!
  } catch (e) {
    if (args.length >= 2 && !(args[1] instanceof Injector)) {
      return args[1]
    }
    throw e
  }
}

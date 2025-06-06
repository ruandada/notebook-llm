import {
  isClassProvider,
  isConstructorProvider,
  isFactoryProvider,
  isValueProvider,
} from './is'
import { requireMark } from './symbol'
import { Token, Provider, ConstructorOf } from './type'

export class Injector {
  protected static readonly rootInjector = new Injector()

  protected static rootInjectorGetter: (() => Injector) | undefined = undefined

  static get $rootInjector(): Injector {
    if (typeof Injector.rootInjectorGetter === 'function') {
      return Injector.rootInjectorGetter()
    }
    return Injector.rootInjector
  }

  static runWithInjector<T = void>(injector: Injector, callback: () => T): T {
    const originalGetter = Injector.rootInjectorGetter
    Injector.setRootInjectorGetter(() => injector)
    let result: T

    try {
      result = callback()
    } finally {
      Injector.setRootInjectorGetter(originalGetter)
    }
    return result
  }

  static setRootInjectorGetter(
    injectorGetter: (() => Injector) | undefined
  ): void {
    if (typeof injectorGetter === 'function') {
      Injector.rootInjectorGetter = injectorGetter
    } else {
      Injector.rootInjectorGetter = undefined
    }
  }

  protected readonly injectionStore: Map<Token, Provider>

  protected readonly instanceCache: Map<Token, any>

  protected constructor(protected readonly parent?: Injector) {
    this.injectionStore = new Map()
    this.instanceCache = new Map()
  }

  protected static internalGetInstance<T = any>(
    token: Token<T>,
    current: Injector,
    from: Injector,
    useCache: boolean = true
  ): [T | undefined, boolean] {
    if (useCache && from.instanceCache.has(token)) {
      return [from.instanceCache.get(token), true]
    }
    let resolvedInstnace: T | undefined
    let resolved: boolean = false
    if (!current.injectionStore.has(token)) {
      ;[resolvedInstnace, resolved] = current.parent
        ? Injector.internalGetInstance(token, current.parent, from, useCache)
        : [undefined, false]
    } else {
      resolved = true
      const provider = current.injectionStore.get(token)

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const deps = Injector.resolveDependencies(provider!)
      const depInstances = deps.map((dep) =>
        dep !== null ? from.getInstance(dep, useCache) : null
      )
      if (isConstructorProvider(provider)) {
        // eslint-disable-next-line new-cap
        resolvedInstnace = new provider(...depInstances)
      } else if (isClassProvider(provider)) {
        // eslint-disable-next-line new-cap
        resolvedInstnace = new provider.useClass(...depInstances)
      } else if (isFactoryProvider(provider)) {
        resolvedInstnace = provider.useFactory(...depInstances)
      } else if (isValueProvider(provider)) {
        resolvedInstnace = provider.useValue
      } else {
        resolved = false
      }
    }
    if (resolved && useCache) {
      from.instanceCache.set(token, resolvedInstnace)
    }
    return [resolvedInstnace, resolved]
  }

  protected static resolveDependencies(provider: Provider): Token[] {
    if (isConstructorProvider(provider) || isClassProvider(provider)) {
      const cls = isConstructorProvider(provider) ? provider : provider.useClass

      const tokens = (cls as any)[requireMark]
      if (tokens) {
        return tokens
      }

      return Reflect.getMetadata('design:paramtypes', cls) ?? []
    }

    if (isFactoryProvider(provider)) {
      return provider.deps ?? []
    }
    return []
  }

  getInstance<T = any>(
    token: Token<T>,
    useCache: boolean = true
  ): T | undefined {
    const [resolvedInstnace, resolved] = Injector.internalGetInstance(
      token,
      this,
      this,
      useCache
    )
    if (!resolved) {
      throw new Error(
        `di: cannot resolve provider for token ${token.toString()}`
      )
    }
    return resolvedInstnace
  }

  registerProvider<T>(provider: Provider<T>): void {
    let token: Token<T> | undefined
    if (isConstructorProvider(provider)) {
      token = provider
    } else if (
      isClassProvider<T>(provider) ||
      isFactoryProvider<T>(provider) ||
      isValueProvider<T>(provider)
    ) {
      token = provider.provide
    }
    if (!token) {
      throw new Error('cannot recognize provider')
    }
    if (this.injectionStore.has(token)) {
      throw new Error(
        `the token ${
          (token as ConstructorOf<T>)?.name ?? token?.toString()
        } has already been registered`
      )
    }
    this.injectionStore.set(token, provider)
  }

  unregister<T>(token: Token<T>): void {
    this.injectionStore.delete(token)
  }

  hasProvider<T>(token: Token<T>): boolean {
    return this.injectionStore.has(token)
  }

  registerProviders(providers: Provider[]): void {
    providers.forEach((provider) => this.registerProvider(provider))
  }

  createChild(providers?: Provider[]): Injector {
    const childInjector = new Injector(this)
    if (providers?.length) {
      childInjector.registerProviders(providers)
    }
    return childInjector
  }

  clear(): void {
    this.injectionStore.clear()
    this.instanceCache.clear()
  }

  clone(): Injector {
    const siblingInjector = new Injector(this.parent)
    siblingInjector.registerProviders(Array.from(this.injectionStore.values()))
    return siblingInjector
  }
}

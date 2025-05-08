import { Injector } from './injector'
import {
  ConstructorOf, FactoryProvider, Token, ValueProvider,
} from './type'

export type InjectableProvider<T = any> = Omit<ValueProvider<T>, 'provide'> | Omit<FactoryProvider<T>, 'provide'>

export function Injectable<T = any>(provider?: InjectableProvider<T>): ClassDecorator {
  return ((target: ConstructorOf<T>) => {
    Injector.$rootInjector.registerProvider(provider
      ? ({
        ...provider,
        provide: target,
      })
      : target)
  }) as ClassDecorator
}

export function UseToken<T = any>(token: Token<T>): ParameterDecorator {
  return ((target: ConstructorOf<T>, propertyKey: string | symbol, parameterIndex: number) => {
    const deps = Reflect.getMetadata('design:paramtypes', target, propertyKey) as Array<Token<T>>
    deps[parameterIndex] = token
  }) as ParameterDecorator
}

export type ConstructorOf<T = any> = new (...args: any[]) => T

export type Token<T = any> = string | symbol | ConstructorOf<T>

export interface BaseProvider<T> {
  provide: Token<T>
}

export interface ClassProvider<T> extends BaseProvider<T> {
  useClass: ConstructorOf<T>
}

export interface FactoryProvider<T> extends BaseProvider<T> {
  useFactory: (...args: any[]) => T
  deps?: Token<any>[]
}

export interface ValueProvider<T> extends BaseProvider<T> {
  useValue: T
}

export type Provider<T = any> =
  | ConstructorOf<T>
  | ClassProvider<T>
  | FactoryProvider<T>
  | ValueProvider<T>

export const factoryProvider = <T>(
  provide: Token<T>,
  useFactory: (...args: any) => T,
  deps?: Token<any>[]
): FactoryProvider<T> => {
  return {
    provide,
    useFactory,
    deps,
  }
}

export const classProvider = <T>(
  provide: Token<T>,
  useClass: ConstructorOf<T>
): ClassProvider<T> => {
  return {
    provide,
    useClass,
  }
}

export const valueProvider = <T>(
  provide: Token<T>,
  useValue: T
): ValueProvider<T> => {
  return {
    provide,
    useValue,
  }
}

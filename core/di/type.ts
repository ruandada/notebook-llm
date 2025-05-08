export type ConstructorOf<T = any> = new (...args: any[]) => T

export type Token<T = any> = string | symbol | ConstructorOf<T>

export interface BaseProvider<T> {
  provide: Token<T>
}

export interface ClassProvider<T> extends BaseProvider<T> {
  useClass: ConstructorOf<T>
}

export interface FactoryProvider<
T, Deps extends Array<Token<any>> = Array<Token<any>>,
> extends BaseProvider<T> {
  useFactory: (...args: Deps[]) => T
  deps?: Deps
}

export interface ValueProvider<T> extends BaseProvider<T> {
  useValue: T
}

export type Provider<T = any> =
  ConstructorOf<T> | ClassProvider<T> | FactoryProvider<T> | ValueProvider<T>

import {
  ClassProvider, ConstructorOf, FactoryProvider, ValueProvider,
} from './type'

export function isConstructorProvider <T = any>(val: any): val is ConstructorOf<T> {
  return typeof val === 'function'
}

export function isClassProvider <T = any>(val: any): val is ClassProvider<T> {
  return 'useClass' in val
}

export function isFactoryProvider <T = any>(val: any): val is FactoryProvider<T> {
  return 'useFactory' in val
}

export function isValueProvider <T = any>(val: any): val is ValueProvider<T> {
  return 'useValue' in val
}

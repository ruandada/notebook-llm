import { Dispatch, RefObject, SetStateAction, useRef, useState } from 'react'
import { SharedValue, useSharedValue } from 'react-native-reanimated'

export const useFactoryState = <T>(
  factory: () => T
): [T, Dispatch<SetStateAction<T>>] => {
  const valueCreated = useRef(false)
  const state = useState<T>(valueCreated.current ? null! : factory())

  if (!valueCreated.current) {
    valueCreated.current = true
  }

  return state
}

export const useFactorySharedValue = <T>(factory: () => T): SharedValue<T> => {
  const valueCreated = useRef(false)
  const state = useSharedValue<T>(valueCreated.current ? null! : factory())

  if (!valueCreated.current) {
    valueCreated.current = true
  }

  return state
}

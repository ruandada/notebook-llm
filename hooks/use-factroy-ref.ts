import { RefObject, useRef } from 'react'

export const useFactoryRef = <T>(factory: () => T): RefObject<T> => {
  const valueCreated = useRef(false)
  const ref = useRef<T>(null!)

  if (!valueCreated.current) {
    ref.current = factory()
    valueCreated.current = true
  }

  return ref
}

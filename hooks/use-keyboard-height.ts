import { useEffect } from 'react'
import { Keyboard, KeyboardEvent } from 'react-native'
import { useFactoryState } from './use-factory-state'

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useFactoryState(
    () => Keyboard.metrics()?.height ?? 0
  )

  useEffect(() => {
    function onKeyboardDidShow(e: KeyboardEvent) {
      setKeyboardHeight(e.endCoordinates.height)
    }

    function onKeyboardDidHide() {
      setKeyboardHeight(0)
    }

    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      onKeyboardDidShow
    )
    const hideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      onKeyboardDidHide
    )
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  return keyboardHeight
}

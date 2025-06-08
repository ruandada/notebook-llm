import { useEffect } from 'react'
import {
  AnimatableValue,
  Easing,
  SharedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

export const withDefaultTiming = <T extends AnimatableValue = number>(v: T) =>
  withSpring(v, {
    damping: 60,
    stiffness: 300,
    mass: 0.8,
    velocity: 5,
  })

export const useAnimatedValue = <T extends AnimatableValue = number>(
  sourceValue: T,
  animator?: (toValue: T) => T
): SharedValue<T> => {
  const v = useSharedValue<T>(sourceValue)

  useEffect(() => {
    v.value = animator ? animator(sourceValue) : withDefaultTiming(sourceValue)
  }, [sourceValue])

  return v
}

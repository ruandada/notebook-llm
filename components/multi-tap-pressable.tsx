import { memo, useMemo } from 'react'
import { Pressable, PressableProps } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler'

export interface MultiTapPressable extends PressableProps {
  numberOfTaps?: number
  onMultiTap?: (
    e: GestureStateChangeEvent<TapGestureHandlerEventPayload>
  ) => void
}

export const MultiTapPressable: React.FC<MultiTapPressable> = memo(
  ({ numberOfTaps = 2, onMultiTap, children, ...restProps }) => {
    const gesture = useMemo(
      () =>
        Gesture.Tap()
          .numberOfTaps(numberOfTaps)
          .runOnJS(true)
          .onStart((e) => {
            if (onMultiTap) {
              onMultiTap(e)
            }
          }),
      [numberOfTaps, onMultiTap]
    )

    return (
      <GestureDetector gesture={gesture}>
        <Pressable {...restProps}>{children}</Pressable>
      </GestureDetector>
    )
  }
)

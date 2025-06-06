import { BlurView } from 'expo-blur'
import React, { memo, useCallback, useState } from 'react'
import { View, ScrollViewProps, ViewProps } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface PrettyScrollViewProps extends Omit<ViewProps, 'children'> {
  header?: () => React.ReactNode
  children?: (context: {
    headerHeight: number
    onScroll: NonNullable<ScrollViewProps['onScroll']>
  }) => React.ReactNode
}

export const PrettyScrollView: React.FC<PrettyScrollViewProps> = memo(
  ({ header, children, ...restProps }) => {
    const [headerHeight, setHeaderHeight] = useState(20)
    const [headerBlur, setHeaderBlur] = useState(false)

    const insets = useSafeAreaInsets()

    const fadeAnim = useAnimatedStyle(() => {
      return {
        height: headerHeight,
        opacity: withTiming(headerBlur ? 1 : 0, {
          duration: 300,
          easing: Easing.bezier(0.5, 0.01, 0, 1),
        }),
      }
    })

    const handleScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
      ({ nativeEvent }) => {
        setHeaderBlur(nativeEvent.contentOffset.y > 10)
      },
      []
    )

    return (
      <>
        <View
          className="p-5 absolute top-0 left-0 right-0 z-20 box-border"
          style={{ paddingTop: insets.top }}
          onLayout={(e) => {
            setHeaderHeight(e.nativeEvent.layout.height)
          }}
        >
          {header ? header() : null}
        </View>

        <Animated.View
          {...restProps}
          className={[
            'absolute top-0 left-0 right-0 w-full z-10',
            restProps.className || '',
          ].join(' ')}
          style={{
            ...(typeof restProps.style === 'object' ? restProps.style : {}),
            ...fadeAnim,
          }}
        >
          <BlurView
            intensity={100}
            className="w-full h-full border-b border-border"
          />
        </Animated.View>

        {children ? children({ headerHeight, onScroll: handleScroll }) : null}
      </>
    )
  }
)

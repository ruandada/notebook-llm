import { Color, getColorValue, paletteColor } from '@/core/color'
import React, { useMemo } from 'react'
import { Text, View, ViewProps } from 'react-native'

export interface AvatarProps extends Omit<ViewProps, 'children'> {
  fallback?: string | React.ReactNode
  foregroundColor?: Color
  backgroundColor?: Color
  size?: number
}

export const Avatar: React.FC<AvatarProps> = ({
  fallback,
  foregroundColor,
  backgroundColor,
  size = 45,
  ...restProps
}) => {
  const background = useMemo(
    () => getColorValue(backgroundColor ?? paletteColor('violet', 200)),
    [backgroundColor]
  )
  const foreground = useMemo(
    () => getColorValue(foregroundColor ?? paletteColor('violet', 900)),
    [foregroundColor]
  )

  return (
    <View
      {...restProps}
      className="bg-violet-200 rounded-full flex-row items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: background,
      }}
    >
      {typeof fallback === 'string' ? (
        <Text className="text-lg" style={{ color: foreground }}>
          {fallback ?? ''}
        </Text>
      ) : (
        fallback
      )}
    </View>
  )
}

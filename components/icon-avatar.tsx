import React, { memo, useMemo } from 'react'
import { Avatar, AvatarProps } from './avatar'
import { Icon, IconProps } from './icon'
import { getColorValue, paletteColor } from '@/core/color'

export interface IconAvatarProps extends AvatarProps {
  icon: IconProps['name']
}

export const IconAvatar: React.FC<IconAvatarProps> = memo(
  ({ icon, size = 45, foregroundColor, ...restProps }) => {
    const foreground = useMemo(
      () => getColorValue(foregroundColor ?? paletteColor('violet', 900)),
      [foregroundColor]
    )

    return (
      <Avatar
        fallback={
          <Icon name={icon} size={Math.max(10, size - 12)} color={foreground} />
        }
        size={size}
        foregroundColor={foreground}
        {...restProps}
      />
    )
  }
)

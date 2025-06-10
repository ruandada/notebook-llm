import type { IconProps as NativeIconProps } from '@expo/vector-icons/build/createIconSet'
import Entypo from '@expo/vector-icons/Entypo'
import AntDesign from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import Fontisto from '@expo/vector-icons/Fontisto'
import Foundation from '@expo/vector-icons/Foundation'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import React, { memo, useMemo } from 'react'

const seriesMap: Record<string, any> = {
  entypo: Entypo,
  antdesign: AntDesign,
  feather: Feather,
  fontawesome: FontAwesome,
  fontawesome5: FontAwesome5,
  fontawesome6: FontAwesome6,
  fontisto: Fontisto,
  foundation: Foundation,
  ionicons: Ionicons,
  materialcommunityicons: MaterialCommunityIcons,
}

export interface IconProps extends NativeIconProps<string> {
  name: `${
    | 'entypo'
    | 'ionicons'
    | 'antdesign'
    | 'feather'
    | 'fontawesome'
    | 'fontawesome5'
    | 'fontawesome6'
    | 'fontisto'
    | 'foundation'
    | 'ionicons'
    | 'materialcommunityicons'}/${string}`
}

export const Icon: React.FC<IconProps> = memo(
  ({ name, ...restProps }): React.ReactNode => {
    const [Component, key] = useMemo(() => {
      const [componentName, key] = name.split('/', 2)
      return [seriesMap[componentName], key ?? '']
    }, [name])

    if (!Component || !key) {
      return null
    }

    return <Component name={key} {...restProps} />
  }
)

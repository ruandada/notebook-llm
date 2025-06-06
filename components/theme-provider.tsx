import React, { memo, useContext, useMemo } from 'react'
import {
  ColorValue,
  Platform,
  PlatformColor,
  useColorScheme,
  View,
} from 'react-native'
import { vars } from 'nativewind'
import {
  ThemeProvider as NativeThemeProvider,
  DefaultTheme as NativeDefaultTheme,
} from '@react-navigation/native'

type ColorPalette = Record<string, ColorValue>

interface ThemeDefinition {
  colors: Record<string, Record<string, string>>
}

const theme = require('@/assets/theme.yaml') as ThemeDefinition
const ThemePaletteProvider = React.createContext<ColorPalette>({})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = memo(
  ({ children }) => {
    const scheme = useColorScheme() ?? 'light'

    const themePalette = useMemo<ColorPalette>(() => {
      if (!scheme) return {}

      const palette: ColorPalette = {}
      Object.keys(theme.colors).forEach((colorName) => {
        const color = theme.colors[colorName]
        if (Platform.OS === 'ios' && color.ios) {
          palette[colorName] = PlatformColor(color.ios)
        } else if (Platform.OS === 'android' && color.android) {
          palette[colorName] = color.android
        } else if (color[scheme]) {
          palette[colorName] = color[scheme]
        }
      })
      return palette
    }, [scheme])

    // CSS 变量用于提供 platformSelect 中的 default 兜底值，因此不需要考虑 platform color
    const themeVariables = useMemo<Record<string, string>>(() => {
      if (!scheme) return {}

      const colorMap: Record<string, string> = {}
      Object.keys(theme.colors).forEach((colorName) => {
        const color = theme.colors[colorName]
        if (color[scheme]) {
          colorMap[`--theme-color-${colorName}`] = color[scheme]
        }
      })
      return colorMap
    }, [scheme])

    const nativeTheme = useMemo((): ReactNavigation.Theme => {
      return {
        dark: scheme === 'dark',
        fonts: NativeDefaultTheme.fonts,
        colors: {
          primary: theme.colors.tint[scheme],
          background: theme.colors.background[scheme],
          card: theme.colors.background[scheme],
          text: theme.colors.label[scheme],
          border: theme.colors.border[scheme],
          notification: theme.colors.tint[scheme],
        },
      }
    }, [scheme])

    return (
      <NativeThemeProvider value={nativeTheme}>
        <ThemePaletteProvider.Provider value={themePalette}>
          <View className="flex-1" style={vars(themeVariables)}>
            {children}
          </View>
        </ThemePaletteProvider.Provider>
      </NativeThemeProvider>
    )
  }
)

export const useThemeColor = (colorName: string): ColorValue | undefined => {
  const themeColors = useContext(ThemePaletteProvider)
  return themeColors[colorName] ?? undefined
}

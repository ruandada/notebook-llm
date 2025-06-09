import 'react-native-get-random-values'

import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { memo, useEffect } from 'react'
import 'react-native-reanimated'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

import '@/core/i18n'
import '@/assets/global.css'
import { useTranslation } from 'react-i18next'
import { useAppInit } from '@/hooks/use-app-init'
import { Alert, BackHandler } from 'react-native'
import { ThemeProvider } from '@/components/theme-provider'
import dayjs from 'dayjs'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(home)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default function RootLayout() {
  const { loaded, error } = useAppInit()
  const { t } = useTranslation()

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      Alert.alert(t('error'), error?.message || 'unknown error')
      BackHandler.exitApp()
    }
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return <AppLayout />
}

const AppLayout: React.FC = memo(() => {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  )
})

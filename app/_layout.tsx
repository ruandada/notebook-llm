import 'react-native-get-random-values'

import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'

import '@/core/i18n'
import '@/assets/global.css'
import { useTranslation } from 'react-i18next'
import { useAppInit } from '@/hooks/use-app-init'
import { Alert, BackHandler } from 'react-native'
import { ThemeProvider } from '@/components/theme-provider'
import { BlurView } from 'expo-blur'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

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

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const { t } = useTranslation()
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Chat Test',
            headerTitle: () => null,
            headerTransparent: true,
            headerBackground: () => (
              <BlurView intensity={100} className="w-full h-full"></BlurView>
            ),
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}

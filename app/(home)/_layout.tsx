import { Stack } from 'expo-router'
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

const HomeLayout: React.FC = memo(() => {
  const { t } = useTranslation()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ title: t('home') }} />
      <Stack.Screen
        name="chat/[id]"
        options={{
          title: '',
          headerShown: true,
          headerBackground: () => (
            <View className="w-full h-full bg-secondaryBackground" />
          ),
        }}
      />
    </Stack>
  )
})

export default HomeLayout

import { Stack } from 'expo-router'
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

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
        }}
      />
    </Stack>
  )
})

export default HomeLayout

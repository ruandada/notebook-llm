import React from 'react'
import Feather from '@expo/vector-icons/Feather'
import Entypo from '@expo/vector-icons/Entypo'
import { Tabs } from 'expo-router'

import { useTranslation } from 'react-i18next'
import { useThemeColor } from '@/components/theme-provider'
import { useSetScreenOptions } from '@/hooks/use-set-screen-options'

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
export default function TabLayout() {
  const { t } = useTranslation()

  useSetScreenOptions({
    headerShown: false,
  })

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: useThemeColor('tint') as string,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('agent'),
          tabBarIcon: ({ color, size }) => (
            <Entypo name="chat" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t('me'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

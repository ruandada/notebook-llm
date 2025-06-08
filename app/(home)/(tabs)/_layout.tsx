import { useThemeColor } from '@/components/theme-provider'
import { useCreateNewChat } from '@/hooks/use-create-new-chat'
import Entypo from '@expo/vector-icons/Entypo'
import Ionicons from '@expo/vector-icons/Ionicons'
import { PlatformPressable } from '@react-navigation/elements'
import { Tabs, useRouter } from 'expo-router'
import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text } from 'react-native'

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
const TabsLayout: React.FC = memo(() => {
  const { t } = useTranslation()
  const labelColorDark = useThemeColor('label-dark')

  const router = useRouter()

  const { createNewChat } = useCreateNewChat()

  const handleClickCenterButton = useCallback(async (): Promise<void> => {
    const chat = await createNewChat()
    router.push(`/chat/${chat.id}`)
  }, [createNewChat, router])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: useThemeColor('secondaryTint') as string,
        tabBarStyle: {
          flexDirection: 'row',
        },
        tabBarButton: ({ children, ...restProps }) =>
          restProps.testID === 'center-button-holder' ? (
            <View className="flex-row items-center justify-center h-full">
              <PlatformPressable onPress={handleClickCenterButton}>
                <View className="flex-row items-center justify-center bg-tint w-16 h-10 rounded-md">
                  <Entypo name="plus" size={24} color={labelColorDark} />
                </View>
              </PlatformPressable>
            </View>
          ) : (
            <PlatformPressable {...restProps}>{children}</PlatformPressable>
          ),
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: t('chat.list'),
          tabBarIcon: ({ color, size }) => (
            <Entypo name="chat" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="center-button-holder"
        options={{
          tabBarButtonTestID: 'center-button-holder',
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
})

export default TabsLayout

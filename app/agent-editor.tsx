import { useSetScreenOptions } from '@/hooks/use-set-screen-options'
import { useRouter } from 'expo-router'
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'

const CancelButton: React.FC = memo(() => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Pressable onPress={() => router.back()}>
      <Text className="text-lg text-danger">{t('cancel')}</Text>
    </Pressable>
  )
})

const AgentEditorScreen: React.FC = memo(() => {
  const { t } = useTranslation()

  useSetScreenOptions({
    presentation: 'modal',
    headerTransparent: true,
    title: t('new_sth', { name: t('agent') }),
    headerLeft: () => <CancelButton />,
    headerBlurEffect: 'regular',
  })

  return <View className="flex-1 bg-secondaryBackground"></View>
})

export default AgentEditorScreen

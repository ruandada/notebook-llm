import { useSetScreenOptions } from '@/hooks/use-set-screen-options'
import { useAnimatedHeaderHeight } from '@react-navigation/native-stack'
import { useRouter } from 'expo-router'
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'

const CancelButton: React.FC = memo(() => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Pressable onPress={() => router.back()}>
      <Text className="text-xl text-destructive">{t('cancel')}</Text>
    </Pressable>
  )
})

const AgentEditorScreen: React.FC = memo(() => {
  const { t } = useTranslation()

  useSetScreenOptions({
    presentation: 'modal',
    title: t('new_sth', { name: t('agent') }),
    headerLeft: () => <CancelButton />,
    headerTransparent: true,
    headerBlurEffect: 'regular',
  })

  return (
    <ScrollView className="flex-1 bg-background">
      <SafeAreaView>
        <View className="flex flex-col p-4 gap-4">
          <TextInput
            className="bg-secondaryBackground rounded-lg h-12 px-4 text-label text-lg"
            placeholder={t('name')}
          />
        </View>
      </SafeAreaView>
    </ScrollView>
  )
})

export default AgentEditorScreen

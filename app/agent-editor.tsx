import { Form } from '@/components/form'
import { FormItem } from '@/components/form/form-item'
import { useSetScreenOptions } from '@/hooks/use-set-screen-options'
import { useHeaderHeight } from '@react-navigation/elements'
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
    headerLargeTitle: true,
  })

  const headerHeight = useHeaderHeight()

  return (
    <ScrollView
      className="flex-1 bg-secondaryBackground"
      style={{ paddingTop: headerHeight }}
    >
      <View className="flex-1 p-4">
        <Form>
          <FormItem>
            <TextInput
              className="text-label text-xl h-10"
              placeholder={t('name')}
            />
          </FormItem>
          <FormItem>
            <TextInput
              className="text-label text-xl h-10"
              placeholder={t('name')}
            />
          </FormItem>
        </Form>
      </View>
    </ScrollView>
  )
})

export default AgentEditorScreen

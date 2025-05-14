import { useSetScreenOptions } from '@/hooks/use-set-screen-options'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

export default function TabTwoScreen() {
  const { t } = useTranslation()
  useSetScreenOptions({
    headerShown: false,
  })
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="font-bold text-2xl text-label">Tab Two</Text>
    </View>
  )
}

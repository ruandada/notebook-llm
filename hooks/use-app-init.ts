import { useInstance } from '@/core/di'
import { composeInitables, useInitableInit } from '@/core/initable'
import { ModelStorage } from '@/dao/base'
import { ChatMessageModel } from '@/dao/chat-message'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFonts } from 'expo-font'

interface AppInitResult {
  loaded: boolean
  error: Error | null
}

export const useAppInit = (): AppInitResult => {
  const [fontLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  })

  const [initableLoaded, initableError] = useInitableInit(
    composeInitables(
      'sequence',
      useInstance(ModelStorage),
      composeInitables('parallel', useInstance(ChatMessageModel))
    )
  )

  return {
    loaded: fontLoaded && initableLoaded,
    error: fontError || initableError || null,
  }
}

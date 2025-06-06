import { useInstance } from '@/core/di'
import { compose, useInitableInit } from '@/core/initable'
import { FileSystemCleaner } from '@/core/utils'
import { ModelStorage } from '@/dao/base'
import { ChatModel } from '@/dao/chat'
import { ChatMessageModel } from '@/dao/chat-message'
import { ConfigStore } from '@/store/config'
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
    compose(
      'sequence',
      // useInstance(FileSystemCleaner),
      compose(
        'parallel',
        useInstance(ConfigStore),
        compose(
          'sequence',
          useInstance(ModelStorage),
          compose(
            'parallel',
            useInstance(ChatMessageModel),
            useInstance(ChatModel)
          )
        )
      )
    )
  )

  return {
    loaded: fontLoaded && initableLoaded,
    error: fontError || initableError || null,
  }
}

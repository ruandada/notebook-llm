import { useInstance } from '@/core/di'
import { compose, useInitableInit } from '@/core/initable'
import { ChatModel } from '@/dao/chat'
import { ChatMessageModel } from '@/dao/chat-message'
import { ConfigStore } from '@/store/config'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFonts } from 'expo-font'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { useEffect } from 'react'
import { getLocales } from 'expo-localization'
import { FileSystemCleaner } from '@/core/utils'
import { SQLiteStorage } from '@/core/sqlite'

interface AppInitResult {
  loaded: boolean
  error: Error | null
}

export const useAppInit = (): AppInitResult => {
  useEffect(() => {
    dayjs.extend(relativeTime)

    const [locale] = getLocales()
    const languageCode = locale?.languageCode ?? 'en'

    dayjs.locale(languageCode === 'zh' ? 'zh-cn' : 'en')
  }, [])

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
          useInstance(SQLiteStorage),
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

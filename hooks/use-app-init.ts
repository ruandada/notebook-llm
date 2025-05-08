import { useInstance } from '@/core/di'
import { Store } from '@/core/store/store'
import { AgentStore } from '@/store/agents'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFonts } from 'expo-font'
import { useEffect, useState } from 'react'

interface AppInitResult {
  loaded: boolean
  error: Error | null
}

export const useAppInit = (): AppInitResult => {
  const [fontLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  })

  const [storeLoaded, setStoreLoaded] = useState(false)
  const [storeError, setStoreError] = useState<Error | null>(null)

  const stores: Store<any>[] = [useInstance(AgentStore)]

  useEffect(() => {
    Promise.all(stores.map((store) => store.syncAsync()))
      .then(() => setStoreLoaded(true))
      .catch((err) => {
        setStoreError(err)
      })
  }, [])

  return {
    loaded: fontLoaded && storeLoaded,
    error: fontError || storeError || null,
  }
}

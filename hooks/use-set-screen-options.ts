import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { useNavigation } from 'expo-router'
import { useEffect } from 'react'

export const useSetScreenOptions = (opt: NativeStackNavigationOptions) => {
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions(opt)
  }, [])
}

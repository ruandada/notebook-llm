import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { useNavigation } from 'expo-router'
import React, { useEffect } from 'react'

export const useScreenOptions = (
  opt: NativeStackNavigationOptions,
  deps: React.DependencyList
) => {
  let navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions(opt)
  }, deps ?? [])
}

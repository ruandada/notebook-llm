import { Stack } from 'expo-router'
import React, { memo } from 'react'

const HomeLayout: React.FC = memo(() => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
})

export default HomeLayout

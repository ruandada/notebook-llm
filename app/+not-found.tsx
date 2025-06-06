import { Link, Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

import React from 'react'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-4 bg-background">
        <Text className="text-label font-bold text-2xl">
          This screen doesn't exist.
        </Text>

        <Link href="/chat" style={styles.link}>
          <Text className="text-label" style={styles.linkText}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
})

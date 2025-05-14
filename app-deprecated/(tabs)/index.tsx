import { FlatList, Pressable, Text, TextInput } from 'react-native'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Link } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { useInstance } from '@/core/di'
import { useStore } from '@/core/store'
import { AgentDefinition, AgentStore } from '@/store/agents'
import React, { memo, useMemo } from 'react'
import words from 'lodash/words'
import { useThemeColor } from '@/components/theme-provider'
import { useSetScreenOptions } from '@/hooks/use-set-screen-options'

import { PrettyScrollView } from '@/components/pretty-scroll-view'

const AgentListItem: React.FC<{ agent: AgentDefinition }> = memo(
  ({ agent }) => {
    const avatarFallback = useMemo(() => {
      if (!agent.title) {
        return '?'
      }
      const [first, second] = words(agent.title)
      return (
        second ? `${first[0]}${second[0]}` : first.substring(0, 2)
      ).toUpperCase()
    }, [agent.title])

    return (
      <Pressable className="flex-row items-center gap-4 p-4 active:bg-cardHoverBackground">
        <View className="bg-violet-600 rounded-full flex-row items-center justify-center w-12 h-12">
          <Text className="text-white">{avatarFallback}</Text>
        </View>
        <View>
          <Text className="text-lg font-bold text-label">{agent.title}</Text>
          <Text className="mt-1 text-md text-secondaryLabel">
            {agent.description}
          </Text>
        </View>
      </Pressable>
    )
  }
)

const AddButton: React.FC = memo(() => {
  return (
    <Link href="/agent-editor" asChild>
      <Pressable>
        <Feather name="plus" size={28} color={useThemeColor('tint')} />
      </Pressable>
    </Link>
  )
})

export default function AgentListScreen() {
  const { t } = useTranslation()
  const store = useInstance(AgentStore)
  const agentList = useStore(store)

  useSetScreenOptions({
    headerShown: false,
  })

  return (
    <PrettyScrollView
      header={() => (
        <>
          <View className="flex-row items-center justify-between gap-2 mt-5">
            <Text className="text-label text-4xl">
              {t('my_sth', { name: t('agent') })}
            </Text>
            <AddButton />
          </View>
        </>
      )}
    >
      {({ onScroll, headerHeight }) => (
        <FlatList
          ListHeaderComponent={() => (
            <View className="p-4">
              <TextInput
                placeholder={t('search')}
                clearButtonMode="always"
                className="bg-cardHoverBackground rounded-lg h-12 p-2 text-label border border-transparent focus:border-tint"
              />
            </View>
          )}
          className="flex-1 bg-secondaryBackground"
          style={{ paddingTop: headerHeight }}
          data={agentList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AgentListItem agent={item} />}
          onScroll={onScroll}
        />
      )}
    </PrettyScrollView>
  )
}

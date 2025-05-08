import { FlatList, Pressable, SafeAreaView, Text } from 'react-native'
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
      <Pressable>
        <View className="flex-row items-center gap-4 p-4">
          <View className="bg-violet-600 rounded-full flex-row items-center justify-center w-12 h-12">
            <Text className="text-white">{avatarFallback}</Text>
          </View>
          <View>
            <Text className="text-lg font-bold text-label">{agent.title}</Text>
            <Text className="mt-1 text-md text-secondaryLabel">
              {agent.description}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }
)

export default function AgentListScreen() {
  const { t } = useTranslation()

  const store = useInstance(AgentStore)
  const agentList = useStore(store)

  return (
    <View className="flex-1">
      <SafeAreaView>
        <View className="flex flex-row items-center justify-between p-4">
          <Text className="text-3xl font-bold text-label">
            {t('my_sth', { name: t('agent') })}
          </Text>
          <Link href="/agent-editor" asChild>
            <Pressable>
              <Feather name="plus" size={28} color={useThemeColor('tint')} />
            </Pressable>
          </Link>
        </View>

        <FlatList
          data={agentList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AgentListItem agent={item} />}
        />
      </SafeAreaView>
    </View>
  )
}

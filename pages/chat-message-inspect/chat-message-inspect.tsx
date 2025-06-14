import { useInstance } from '@/core/di'
import { ChatMessageModel } from '@/dao/chat-message'
import { useRequest } from '@/hooks/use-request'
import React, { memo, useEffect } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { ChatMessage } from '@/dao/chat-message.type'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useThemeColor } from '@/components/theme-provider'
import { useTranslation } from 'react-i18next'

export interface ChatMessageInspectProps {
  messageId: string
}

export const ChatMessageInspect: React.FC<ChatMessageInspectProps> = memo(
  ({ messageId }): React.ReactNode => {
    const chatMessageModel = useInstance(ChatMessageModel)
    const destructiveColor = useThemeColor('destructive')
    const { t } = useTranslation()

    const {
      loading,
      data: message,
      error,
      run,
    } = useRequest(
      {
        toastError: false,
        runner: async (): Promise<ChatMessage> => {
          const msg = await chatMessageModel.getByMessageId(messageId)
          if (!msg) {
            throw new Error(t('chat.message_not_found'))
          }
          return msg
        },
      },
      [chatMessageModel]
    )

    useEffect(() => {
      run()
    }, [])

    if (loading || (!message && !error)) {
      return (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" />
        </View>
      )
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-4 gap-6 flex-col">
          <MaterialIcons
            name="error-outline"
            size={64}
            color={destructiveColor}
          />
          <Text className="text-destructive text-xl">{error.message}</Text>
        </View>
      )
    }

    return (
      <View className="bg-background">
        <Text>ChatMessageInspect</Text>
      </View>
    )
  }
)

import { MultiTapPressable } from '@/components/multi-tap-pressable'
import { useThemeColor } from '@/components/theme-provider'
import { MessageWithMetadata } from '@/core/chat'
import { MessageController } from '@/core/chat/message-controller'
import { ChatMessage } from '@/dao/chat-message.type'
import {
  ExtendedContextMenuAction,
  useContextMenuActions,
} from '@/hooks/use-context-menu-actions'
import { useRouter } from 'expo-router'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, PressableProps, StyleProp, View } from 'react-native'
import ContextMenu, { ContextMenuProps } from 'react-native-context-menu-view'

export interface ChatMessageContextMenuProps
  extends Omit<ContextMenuProps, 'actions'> {
  message: MessageWithMetadata<ChatMessage>
  controller: MessageController
  children?: React.ReactNode
  className?: string
  style?: StyleProp<PressableProps>
}

export const ChatMessageContextMenu: React.FC<ChatMessageContextMenuProps> =
  memo(
    ({
      message,
      controller,
      children,
      className,
      style,
      disabled,
      ...restProps
    }): React.ReactNode => {
      const secondaryBackgroundColor = useThemeColor('secondaryBackground')
      const { t } = useTranslation()
      const router = useRouter()

      const handleDoubleTap = useCallback(() => {
        router.push(`/chat/message/${message.msg.id}/inspect`)
      }, [message.msg.id, router])

      const { actions, onPress } = useContextMenuActions(
        useMemo<ExtendedContextMenuAction[]>(
          () => [
            ...(message.stage === 'history' && message.msg.role === 'assistant'
              ? ([
                  {
                    title: t('chat.re_answer'),
                    subtitle: t('chat.re_answer_subtitle'),
                    systemIcon: 'arrow.clockwise',
                  },
                ] as ExtendedContextMenuAction[])
              : []),

            {
              title: t('chat.inspect'),
              subtitle: t('chat.inspect_subtitle'),
              systemIcon: 'bubble.and.pencil',
              onPress: () => {
                router.push(`/chat/message/${message.msg.id}/inspect`)
              },
            },

            ...(message.stage === 'history' && message.status === 'finished'
              ? ([
                  {
                    title: t('delete'),
                    destructive: true,
                    systemIcon: 'delete.left.fill',
                    onPress: () => {
                      controller.removeHistoryMessage(message.msg.id)
                    },
                  },
                ] as ExtendedContextMenuAction[])
              : []),
          ],
          [message, t, controller, router]
        )
      )

      if (disabled) {
        return (
          <View className={className} style={style}>
            {children}
          </View>
        )
      }

      return (
        <ContextMenu
          {...restProps}
          onPress={onPress}
          actions={actions}
          previewBackgroundColor={secondaryBackgroundColor}
        >
          <MultiTapPressable
            className={className}
            style={style}
            onMultiTap={handleDoubleTap}
          >
            {children}
          </MultiTapPressable>
        </ContextMenu>
      )
    }
  )

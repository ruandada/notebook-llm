import { useThemeColor } from '@/components/theme-provider'
import { MessageWithMetadata } from '@/core/chat'
import { MessageController } from '@/core/chat/message-controller'
import { ChatMessage } from '@/dao/chat-message.type'
import {
  ExtendedContextMenuAction,
  useContextMenuActions,
} from '@/hooks/use-context-menu-actions'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NativeSyntheticEvent } from 'react-native'
import ContextMenu, {
  ContextMenuOnPressNativeEvent,
  ContextMenuProps,
} from 'react-native-context-menu-view'

export interface ChatMessageContextMenuProps
  extends Omit<ContextMenuProps, 'actions'> {
  message: MessageWithMetadata<ChatMessage>
  controller: MessageController
  children?: React.ReactNode
}

export const ChatMessageContextMenu: React.FC<ChatMessageContextMenuProps> =
  memo(({ message, controller, children, ...restProps }): React.ReactNode => {
    const secondaryBackgroundColor = useThemeColor('secondaryBackground')
    const { t } = useTranslation()

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
        [message, t, controller]
      )
    )

    return (
      <ContextMenu
        {...restProps}
        onPress={onPress}
        actions={actions}
        previewBackgroundColor={secondaryBackgroundColor}
      >
        {children}
      </ContextMenu>
    )
  })

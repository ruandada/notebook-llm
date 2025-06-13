import { useThemeColor } from '@/components/theme-provider'
import { MessageWithMetadata } from '@/core/chat'
import { ChatMessage } from '@/dao/chat-message.type'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { NativeSyntheticEvent } from 'react-native'
import ContextMenu, {
  ContextMenuOnPressNativeEvent,
  ContextMenuProps,
} from 'react-native-context-menu-view'

export interface ChatMessageContextMenuProps
  extends Omit<ContextMenuProps, 'actions'> {
  message: MessageWithMetadata<ChatMessage>
  children?: React.ReactNode
}

export const ChatMessageContextMenu: React.FC<ChatMessageContextMenuProps> =
  memo(({ message, children, ...restProps }): React.ReactNode => {
    const secondaryBackgroundColor = useThemeColor('secondaryBackground')
    const { t } = useTranslation()

    const handleTriggerAction = useCallback(
      (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
        console.log(e.nativeEvent.name)
      },
      [message]
    )

    return (
      <ContextMenu
        {...restProps}
        onPress={handleTriggerAction}
        actions={[
          ...(message.stage === 'history' && message.msg.role === 'assistant'
            ? [
                {
                  title: t('chat.re_answer'),
                  subtitle: t('chat.re_answer_subtitle'),
                  systemIcon: 'arrow.clockwise',
                },
              ]
            : []),

          {
            title: t('chat.inspect'),
            subtitle: t('chat.inspect_subtitle'),
            systemIcon: 'bubble.and.pencil',
          },

          ...(message.stage === 'history'
            ? [
                {
                  title: t('delete'),
                  destructive: true,
                  systemIcon: 'delete.left.fill',
                },
              ]
            : []),
        ]}
        previewBackgroundColor={secondaryBackgroundColor}
      >
        {children}
      </ContextMenu>
    )
  })

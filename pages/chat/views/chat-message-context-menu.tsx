import { useThemeColor } from '@/components/theme-provider'
import { MessageWithMetadata } from '@/core/chat'
import { ChatMessage } from '@/dao/chat-message.type'
import { memo } from 'react'
import ContextMenu from 'react-native-context-menu-view'

export interface ChatMessageContextMenuProps {
  message: ChatMessage
  status: MessageWithMetadata['status']
  children?: React.ReactNode
}

export const ChatMessageContextMenu: React.FC<ChatMessageContextMenuProps> =
  memo(({ children }): React.ReactNode => {
    const secondaryBackgroundColor = useThemeColor('secondaryBackground')

    return (
      <ContextMenu
        actions={[
          { title: 'Title 1' },
          { title: 'Title 2', destructive: true },
        ]}
        previewBackgroundColor={secondaryBackgroundColor}
      >
        {children}
      </ContextMenu>
    )
  })

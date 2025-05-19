import { useInstance } from '@/core/di'
import { useRequest } from './use-request'
import { ChatModel } from '@/dao/chat'
import { Chat } from '@/dao/chat.type'
import { ChatCreatedEvent, useEventbus } from '@/core/eventbus'

export const useCreateNewChat = () => {
  const chatModel = useInstance(ChatModel)
  const eventbus = useEventbus()

  const { run: createNewChat, loading: creating } = useRequest(
    {
      runner: (): Promise<Chat> => chatModel.creteEmptyChat(),
      onSuccess: (data) => {
        eventbus.emit<ChatCreatedEvent>({
          event: 'chat.created',
          data: {
            chat: data,
          },
        })
      },
    },
    [eventbus]
  )

  return {
    createNewChat,
    creating,
  }
}

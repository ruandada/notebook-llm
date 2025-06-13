import { AvatarProps } from '@/components/avatar'
import { IconAvatar } from '@/components/icon-avatar'
import { Agent } from '@/dao/agent'
import { memo } from 'react'

export interface AgentAvatarProps extends Omit<AvatarProps, 'icon'> {
  agent: Agent
}

export const AgentAvatar: React.FC<AgentAvatarProps> = memo(
  ({ agent, size = 32, ...restProps }) => {
    return (
      <IconAvatar
        icon="materialcommunityicons/face-agent"
        size={size}
        {...restProps}
      />
    )
  }
)

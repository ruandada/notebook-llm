import { useCallback, useMemo } from 'react'
import { NativeSyntheticEvent } from 'react-native'
import {
  ContextMenuAction,
  ContextMenuOnPressNativeEvent,
} from 'react-native-context-menu-view'

export interface ExtendedContextMenuAction extends ContextMenuAction {
  onPress?: (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => void
}

export const useContextMenuActions = (actions: ExtendedContextMenuAction[]) => {
  const { nativeActions, actionMap } = useMemo(() => {
    const nativeActions: ContextMenuAction[] = []
    const actionMap: Record<number, ExtendedContextMenuAction> = {}

    actions.forEach((action, index) => {
      const { onPress, ...rest } = action
      nativeActions.push(rest)
      actionMap[index] = action
    })

    return { nativeActions, actionMap }
  }, [actions])

  const onPress = useCallback(
    (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
      const action = actionMap[e.nativeEvent.index]
      if (action?.onPress) {
        action.onPress(e)
      }
    },
    [actionMap]
  )

  return {
    actions: nativeActions,
    onPress,
  }
}

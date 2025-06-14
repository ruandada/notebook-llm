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
  const nativeActions = useMemo(
    () => actions.map(({ onPress, ...rest }) => rest),
    [actions]
  )

  const onPress = useCallback(
    (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
      const action = actions[e.nativeEvent.index]
      if (action?.onPress) {
        action.onPress(e)
      }
    },
    [actions]
  )

  return {
    actions: nativeActions,
    onPress,
  }
}

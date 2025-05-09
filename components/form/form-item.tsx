import clsx from 'clsx'
import React, { memo } from 'react'
import { View, ViewProps } from 'react-native'

export interface FormItemProps extends ViewProps {}

export const FormItem: React.FC<FormItemProps> = memo(
  ({ children, ...props }) => {
    return (
      <View
        {...props}
        className={clsx(
          props.className,
          'items-stretch border-b border-border pb-2'
        )}
      >
        {children}
      </View>
    )
  }
)

import React, { memo } from 'react'
import { View, ViewProps } from 'react-native'
import clsx from 'clsx'

export interface FormProps extends ViewProps {}

export const Form: React.FC<FormProps> = memo(({ children, ...props }) => {
  return (
    <View
      {...props}
      className={clsx(
        props.className,
        'bg-cardBackground pl-6 py-2 rounded-lg gap-2 -mb-6'
      )}
    >
      {children}
    </View>
  )
})

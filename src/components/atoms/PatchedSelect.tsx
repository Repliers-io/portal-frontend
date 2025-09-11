import React, { useImperativeHandle, useRef } from 'react'

import { Select, type SelectProps } from '@mui/material'

const PatchedSelect = React.forwardRef<HTMLDivElement, SelectProps<unknown>>(
  (props, parentRef) => {
    const ref = useRef<HTMLDivElement>(null)
    const { onClose, onOpen, ...otherProps } = props

    useImperativeHandle(parentRef, () => ref.current!)

    const blurOnClose = (e: React.SyntheticEvent<Element, Event>) => {
      onClose?.(e)
      if (ref.current) {
        ref.current.classList.remove('Mui-focused')
      }
    }

    const focusOnOpen = (e: React.SyntheticEvent<Element, Event>) => {
      onOpen?.(e)
      if (ref.current) {
        ref.current.classList.add('Mui-focused')
      }
    }

    return (
      <Select
        ref={ref}
        {...otherProps}
        onOpen={focusOnOpen}
        onClose={blurOnClose}
      />
    )
  }
)

PatchedSelect.displayName = 'PatchedSelect'

export default PatchedSelect

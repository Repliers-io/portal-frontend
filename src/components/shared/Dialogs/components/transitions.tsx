import React from 'react'

import { Slide, Zoom } from '@mui/material'
import { type TransitionProps } from '@mui/material/transitions'

type CustomTransitionProps = TransitionProps & {
  children: React.ReactElement<any>
}

export const zoomInTransition = React.forwardRef(function Transition(
  props: CustomTransitionProps,
  ref: React.Ref<unknown>
) {
  return <Zoom in ref={ref} {...props} />
})

export const slideUpTransition = React.forwardRef(function Transition(
  props: CustomTransitionProps,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

export const emptyTransition = React.forwardRef<
  HTMLDivElement,
  TransitionProps
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(function Transition(props, ref) {
  return props.children
})

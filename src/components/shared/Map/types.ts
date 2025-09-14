import { type MouseEventHandler, type TouchEventHandler } from 'react'

export type MarkerProps = {
  id?: string
  label?: string
  link?: string
  status?: string
  size?: 'point' | 'tag' | 'cluster'
  onClick?: MouseEventHandler
  // TODO: there should be no difference between onClick and onTap
  onTap?: TouchEventHandler
  onMouseEnter?: MouseEventHandler
  onMouseLeave?: MouseEventHandler
}

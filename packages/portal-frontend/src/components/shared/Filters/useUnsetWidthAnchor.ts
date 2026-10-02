import { type RefObject, useLayoutEffect, useRef } from 'react'

import { type PopoverOrigin } from '@mui/material'

/**
 * A content-sized chip widens with its value, so its popover would drift with it.
 * This anchors the popover to the chip's left edge at half the chip's unset width:
 * centred on the unset chip, and unmoved once a value widens the chip. The width is
 * read whenever the popover opens on an unset chip and whenever the value clears —
 * the chip mounts after hydration, so a mount-time read finds no element. Until an
 * unset width has been seen, the current width stands in.
 */
export const useUnsetWidthAnchor = (
  anchorRef: RefObject<HTMLElement | null>,
  unset: boolean,
  open: boolean
): PopoverOrigin => {
  const unsetWidth = useRef<number>(undefined)

  useLayoutEffect(() => {
    if (unset && anchorRef.current)
      unsetWidth.current = anchorRef.current.offsetWidth
  }, [unset, open, anchorRef])

  return {
    vertical: 'bottom',
    horizontal: (unsetWidth.current ?? anchorRef.current?.offsetWidth ?? 0) / 2
  }
}

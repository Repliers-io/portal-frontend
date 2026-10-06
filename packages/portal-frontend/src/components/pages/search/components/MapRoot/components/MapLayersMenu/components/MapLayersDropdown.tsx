import type { ReactNode } from 'react'

import { Popover, Stack } from '@mui/material'

export type MapLayersDropdownProps = {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Default presentation of the layers dropdown — a clean popover with comfortable
 * padding and no dividers between rows. The toggle rows are passed in as children
 * by the container, so tenant-specific looks can fork only this wrapper via
 * `_<tenant>/MapLayersDropdown` without duplicating the row logic.
 */
export const MapLayersDropdown = ({
  anchorEl,
  open,
  onClose,
  children
}: MapLayersDropdownProps) => (
  <Popover
    open={open}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'center', horizontal: -16 }}
    transformOrigin={{ vertical: 'center', horizontal: 'right' }}
    slotProps={{
      paper: {
        sx: {
          py: 1,
          boxShadow: 3,
          minWidth: 200
        }
      }
    }}
    disableScrollLock
  >
    <Stack>{children}</Stack>
  </Popover>
)

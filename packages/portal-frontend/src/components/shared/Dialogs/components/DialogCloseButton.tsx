import React from 'react'

import { IconButton, type SxProps } from '@mui/material'

import { CloseIcon } from '@configs/icons'

const DialogCloseButton = ({
  sx,
  onClose
}: {
  sx?: SxProps
  onClose: () => void
}) => {
  return (
    <IconButton
      aria-label="close"
      size="large"
      sx={{
        top: 8,
        right: 8,
        position: 'absolute',
        color: 'common.black',
        ...sx
      }}
      onClick={onClose}
    >
      <CloseIcon sx={{ width: 24, height: 24 }} />
    </IconButton>
  )
}

export default DialogCloseButton

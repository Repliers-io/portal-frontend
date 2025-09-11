import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { IconButton, type SxProps } from '@mui/material'

const DialogCloseButton = ({
  sx,
  onClose
}: {
  sx?: SxProps
  onClose: () => void
}) => {
  return (
    <IconButton
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

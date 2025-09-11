import React from 'react'

import { Box, Dialog } from '@mui/material'

import { type DialogName, useDialog } from 'providers/DialogProvider'

import {
  DialogCloseButton,
  emptyTransition,
  zoomInTransition
} from './components'

const BaseFullscreenDialog = ({
  name = 'unknown',
  onClose,
  children
}: {
  name?: DialogName
  onClose?: () => void
  children: React.ReactNode
}) => {
  const { visible, animate, hideDialog } = useDialog(name)

  const handleClose = () => {
    hideDialog()
    onClose?.()
  }

  return (
    <Dialog
      fullScreen
      open={visible}
      onClose={handleClose}
      sx={{
        zIndex: 'modal',
        '.MuiBackdrop-root': {
          bgcolor: '#000E' // darker than usual background
        },
        // hide all styling of the paper and expand it to the full screen
        '.MuiPaper-root': {
          width: '100%',
          height: '100svh',
          boxShadow: 'none',
          bgcolor: 'transparent'
        },

        '& .MuiDialogTitle-root': {
          top: 0,
          left: 0,
          right: 0,
          py: 2,
          position: 'absolute',
          color: 'common.white'
        },
        '& .MuiDialogContent-root': {
          p: 0,
          left: 0,
          right: 0,
          top: '64px',
          bottom: { xs: 0, sm: '64px' },
          position: 'absolute',
          color: 'common.white',
          alignContent: 'center'
        },
        '& .MuiDialogActions-root': {
          p: 2,
          left: 0,
          right: 0,
          bottom: 0,
          position: 'absolute',
          bgcolor: 'transparent',
          color: 'common.white'
        }
      }}
      slots={{ transition: animate ? zoomInTransition : emptyTransition }}
    >
      <Box
        sx={{
          zIndex: 1,
          height: '100%',
          position: 'relative'
        }}
      >
        {children}
      </Box>
      <Box
        sx={{
          top: 0,
          right: 0,
          zIndex: 'tooltip',
          position: 'absolute',
          '& > * ': { color: 'white !important' } // recolor close button
        }}
      >
        <DialogCloseButton onClose={handleClose} />
      </Box>
    </Dialog>
  )
}

export default BaseFullscreenDialog

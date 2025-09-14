import React from 'react'

import { Dialog } from '@mui/material'

import { type DialogName, useDialog } from 'providers/DialogProvider'
import useBreakpoints from 'hooks/useBreakpoints'

import {
  DialogCloseButton,
  emptyTransition,
  slideUpTransition,
  zoomInTransition
} from './components'

const BaseResponsiveDialog = ({
  name = 'unknown',
  maxWidth = 640,
  onClose,
  children
}: {
  name?: DialogName
  maxWidth?: string | number | { [key: string]: string | number }
  onClose?: () => void
  children: React.ReactNode
}) => {
  const { mobile } = useBreakpoints()
  const { visible, animate, hideDialog } = useDialog(name)

  const handleClose = () => {
    hideDialog()
    onClose?.()
  }
  const transition = mobile ? slideUpTransition : zoomInTransition

  return (
    <Dialog
      open={visible}
      onClose={handleClose}
      fullScreen={mobile}
      sx={{ zIndex: 'modal', '.MuiPaper-root': { width: '100%', maxWidth } }}
      TransitionComponent={animate ? transition : emptyTransition}
    >
      <DialogCloseButton onClose={handleClose} />
      {children}
    </Dialog>
  )
}

export default BaseResponsiveDialog

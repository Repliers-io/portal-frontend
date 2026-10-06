import React, { type CSSProperties } from 'react'

import { Drawer } from '@mui/material'
import { type ResponsiveStyleValue } from '@mui/system'

import { type DialogName, useDialog } from 'providers/DialogProvider'

const DialogDrawer = ({
  maxWidth = '100%',
  dialogName,
  labelledBy,
  children
}: {
  maxWidth?: ResponsiveStyleValue<CSSProperties['maxWidth']>
  dialogName: DialogName
  /** Id of the visible title that names this dialog for assistive tech. */
  labelledBy?: string
  children: React.ReactNode
}) => {
  const { visible, animate, hideDialog } = useDialog(dialogName)

  return (
    <Drawer
      open={visible}
      anchor="bottom"
      onClose={hideDialog}
      disableScrollLock={true}
      // MUI Drawer builds on Modal, which traps focus but never exposes the paper
      // as a dialog. Name it via the visible title so AT announces it as a modal.
      slotProps={{
        transition: { timeout: animate ? 300 : 0 },
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': labelledBy
        }
      }}
      sx={{
        zIndex: 'modal',
        '& > .MuiPaper-root': {
          maxWidth,
          mx: 'auto',
          width: '100%',
          height: '100svh',
          borderRadius: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
    >
      {children}
    </Drawer>
  )
}

export default DialogDrawer

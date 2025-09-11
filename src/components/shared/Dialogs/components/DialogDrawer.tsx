import React, { type CSSProperties } from 'react'

import { Drawer } from '@mui/material'
import { type ResponsiveStyleValue } from '@mui/system'

import { type DialogName, useDialog } from 'providers/DialogProvider'

const DialogDrawer = ({
  maxWidth = '100%',
  dialogName,
  children
}: {
  maxWidth?: ResponsiveStyleValue<CSSProperties['maxWidth']>
  dialogName: DialogName
  children: React.ReactNode
}) => {
  const { visible, animate, hideDialog } = useDialog(dialogName)

  return (
    <Drawer
      open={visible}
      anchor="bottom"
      onClose={hideDialog}
      SlideProps={{ timeout: animate ? 300 : 0 }}
      sx={{
        zIndex: 'modal',
        '& > .MuiPaper-root': {
          maxWidth,
          mx: 'auto',
          width: '100%',
          height: '100svh',
          borderRadius: 0,
          position: 'relative'
        }
      }}
    >
      {children}
    </Drawer>
  )
}

export default DialogDrawer

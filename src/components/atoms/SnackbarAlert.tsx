import React from 'react'

import { Alert, Snackbar, type SnackbarOrigin } from '@mui/material'
import { type AlertProps } from '@mui/material/Alert'

const anchorOrigin: SnackbarOrigin = { vertical: 'top', horizontal: 'center' }

interface SnackbarAlertProps {
  icon?: React.ReactNode
  open: boolean
  onClose: () => void
  message: string | React.ReactNode
  severity: AlertProps['severity']
  duration: number
}

const SnackbarAlert = ({
  icon,
  open,
  onClose,
  message,
  severity,
  duration
}: SnackbarAlertProps) => {
  const handleClose = (_e?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    onClose()
  }

  const multiLine = typeof message === 'string' && message.includes('\n')

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
      autoHideDuration={duration}
    >
      <Alert
        icon={icon}
        variant="filled"
        severity={severity}
        onClose={handleClose}
        sx={{
          width: '100%',
          boxShadow: 1,
          whiteSpace: multiLine ? 'pre-line' : 'normal'
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default SnackbarAlert

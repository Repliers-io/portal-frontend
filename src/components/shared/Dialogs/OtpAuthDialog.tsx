import { useState } from 'react'
import type React from 'react'

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from '@mui/material'

import { useDialog } from 'providers/DialogProvider'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'

import BaseResponsiveDialog from './BaseResponsiveDialog'

const dialogName = 'otp-auth'

const OtpAuthDialog = () => {
  const { showSnackbar } = useSnackbar()
  const [otpCode, setOtpCode] = useState('')
  const { loading, loginWithOtp } = useUser()
  const { hideDialog } = useDialog(dialogName)

  const handleLogin = async () => {
    try {
      await loginWithOtp(otpCode)
      hideDialog()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: any) {
      showSnackbar('Failed to confirm OTP', 'error')
    }
  }

  return (
    <BaseResponsiveDialog name={dialogName} maxWidth={560}>
      <DialogTitle>Sign In Confirmation</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center">
          <Typography textAlign="center">
            The link you are trying to use is expired.
            <br />
            Please check your email/phone for a new authentication link
          </Typography>
          <TextField
            type="text"
            placeholder="------"
            onChange={(e) => setOtpCode(e.target.value)}
            sx={{
              height: 60,
              '& input': {
                width: 248,
                textAlign: 'center',
                fontFamily: 'monospace',
                height: '60px !important',
                fontSize: '40px !important',
                padding: '0 0 0 8px !important',
                letterSpacing: '0.3em'
              }
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            size="large"
            variant="contained"
            loading={loading}
            onClick={handleLogin}
          >
            Continue
          </Button>
          <Button
            size="large"
            variant="outlined"
            disabled={loading}
            onClick={hideDialog}
          >
            Cancel
          </Button>
        </Stack>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}

export default OtpAuthDialog

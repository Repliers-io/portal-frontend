import { useState } from 'react'
import React from 'react'
import { useTranslations } from 'next-intl'

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

import { BaseResponsiveDialog } from '.'

const dialogName = 'otp-auth'

export const OtpAuthDialog = () => {
  const { showSnackbar } = useSnackbar()
  const [otpCode, setOtpCode] = useState('')
  const { loading, loginWithOtp } = useUser()
  const { hideDialog } = useDialog(dialogName)
  const t = useTranslations('Dialogs')

  const handleLogin = async () => {
    try {
      await loginWithOtp(otpCode)
      hideDialog()
    } catch {
      showSnackbar(t('Otp.confirmFailed'), 'error')
    }
  }

  return (
    <BaseResponsiveDialog name={dialogName} maxWidth={560}>
      <DialogTitle>{t('Otp.confirmTitle')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center">
          <Typography textAlign="center">
            {t('Otp.linkExpired')}
            <br />
            {t('Otp.checkNewLink')}
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
            {t('Common.continue')}
          </Button>
          <Button
            size="large"
            variant="outlined"
            disabled={loading}
            onClick={hideDialog}
          >
            {t('Common.cancel')}
          </Button>
        </Stack>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}

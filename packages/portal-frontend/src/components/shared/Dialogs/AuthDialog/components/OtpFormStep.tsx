import { useEffect, useState } from 'react'
import React from 'react'
import { useTranslations } from 'next-intl'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'

import { ArrowBackIcon, HistoryIcon } from '@configs/icons'

const OtpFormStep = ({
  visible = false,
  loading,
  onCancel,
  onSubmit,
  onResend,
  resendTimer = 0,
  resendDisabled
}: {
  visible?: boolean
  loading?: boolean
  onCancel: () => void
  onSubmit: (code: string) => void
  onResend: () => void
  resendTimer?: number
  resendDisabled: boolean
}) => {
  const [otpCode, setOtpCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const t = useTranslations('Dialogs')

  const validateCode = (code: string) => {
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      setErrorMessage('')
      return true
    } else {
      setErrorMessage(t('Otp.invalidCode'))
      return false
    }
  }

  const handleSubmitClick = () => {
    if (validateCode(otpCode)) onSubmit(otpCode)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtpCode(event.target.value)
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmitClick()
    } else if (otpCode.length === 6) {
      // additional validation right after input
      setErrorMessage('')
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('Text').trim()
    const filtered = pasted.replace(/\D/g, '').substring(0, 6)
    setOtpCode(filtered)
    if (validateCode(filtered)) onSubmit(filtered)
  }

  const handleBlur = () => {
    if (!otpCode) setErrorMessage('')
    else validateCode(otpCode)
  }

  const handleBackClick = () => {
    setOtpCode('')
    onCancel()
  }

  const handleResendClick = () => {
    setErrorMessage('')
    setOtpCode('')
    onResend()
  }

  useEffect(() => {
    // clear the OTP code and error message when the dialog becomes visible
    if (visible) {
      setErrorMessage('')
      setOtpCode('')
    }
  }, [visible])

  return (
    <Box sx={{ position: 'relative', display: visible ? 'block' : 'none' }}>
      <Button
        onClick={handleBackClick}
        variant="outlined"
        size="small"
        sx={{
          top: { xs: '-60px', sm: 0 },
          left: 0,
          position: 'absolute',
          color: 'text.primary',
          borderColor: 'divider',
          width: 56,
          height: 40,
          minWidth: 0,
          p: 1
        }}
      >
        <ArrowBackIcon fontSize="small" />
      </Button>
      <Stack spacing={4.5} alignItems="center">
        <Stack spacing={4} width={320} alignItems="center">
          <Typography textAlign="center" variant="body2">
            {t('Otp.checkEmailPhone')}
          </Typography>
          <TextField
            type="number"
            placeholder="------"
            slotProps={{ htmlInput: { min: 0, max: 999999 } }}
            onFocus={(event) => event.target.select()}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            onPaste={handlePaste}
            onBlur={handleBlur}
            helperText={errorMessage}
            error={!!errorMessage}
            disabled={loading}
            value={otpCode}
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
              },
              // hide browser number-spinner arrows
              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                {
                  WebkitAppearance: 'none',
                  margin: 0
                },
              '& input[type=number]': {
                MozAppearance: 'textfield'
              }
            }}
          />
          <Button
            size="large"
            variant="contained"
            loading={loading}
            disabled={loading}
            onClick={handleSubmitClick}
            sx={{ width: 200 }}
          >
            {t('Common.continue')}
          </Button>
        </Stack>

        <Box
          pb={2.5}
          sx={{
            gap: 2,
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: '1fr 1fr'
          }}
        >
          <Box sx={{ justifySelf: 'end' }}>
            <Button
              size="small"
              variant="outlined"
              disabled={resendDisabled || loading}
              onClick={handleResendClick}
            >
              {t('Otp.resendCode')}
            </Button>
          </Box>
          <Box>
            {resendDisabled && (
              <Stack spacing={0.5} direction="row" alignItems="center">
                <HistoryIcon sx={{ fontSize: 20, color: 'text.hint' }} />
                <Typography variant="body2" color="text.hint">
                  {t('Otp.unlocksIn', { seconds: resendTimer })}
                </Typography>
              </Stack>
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}

export default OtpFormStep

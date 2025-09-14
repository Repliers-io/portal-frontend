import { useEffect, useState } from 'react'
import type React from 'react'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HistoryIcon from '@mui/icons-material/History'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'

const codeErrorMessage = 'Please enter a valid 6-digit code'

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

  const validateCode = (code: string) => {
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      setErrorMessage('')
      return true
    } else {
      setErrorMessage(codeErrorMessage)
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
            Please check your email/phone for a one time password (OTP) to
            proceed.
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
            Continue
          </Button>
        </Stack>

        <Stack
          spacing={2}
          direction="row"
          justifyContent="center"
          pb={2.5}
          width={256}
        >
          <Button
            size="small"
            variant="outlined"
            disabled={resendDisabled || loading}
            onClick={handleResendClick}
            sx={{ width: 124, px: 0 }}
          >
            Resend code
          </Button>
          {resendDisabled && (
            <Stack
              spacing={0.5}
              direction="row"
              alignItems="center"
              sx={{ width: 124 }}
            >
              <HistoryIcon sx={{ fontSize: 20, color: 'text.hint' }} />
              <Typography variant="body2" color="text.hint">
                Unlocks in {resendTimer}s
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

export default OtpFormStep

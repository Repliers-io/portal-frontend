import React, { useEffect, useState } from 'react'
import type { ClipboardEvent } from 'react'

import HistoryIcon from '@mui/icons-material/History'
import { Button, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2' // Grid version 2

import { SelectLabel } from 'components/atoms'

import { useEstimate } from 'providers/EstimateProvider'

import {
  EstimateInput,
  GridContainer,
  GridSection,
  GridTitle
} from './components'
import { useFormField } from './hooks'

const resendTimer = 60

const ConfirmationStep = () => {
  const { requestLogin, loading, nextStep } = useEstimate()
  const codeField = useFormField('contact.confirmationCode')

  const [timer, setTimer] = useState(resendTimer)
  const [resendDisabled, setResendDisabled] = useState(true)

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('Text').trim()
    const filtered = pasted.replace(/\D/g, '').substring(0, 6)
    if (filtered.length === 6) {
      codeField.onChange({
        target: { name: codeField.name, value: filtered }
      } as React.ChangeEvent<HTMLInputElement>)
      nextStep()
    }
  }

  const handleResendClick = async () => {
    setResendDisabled(true)
    setTimer(resendTimer)
    await requestLogin()
  }

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setResendDisabled(false)
    }
  }, [timer])

  return (
    <GridContainer>
      <GridSection>
        <GridTitle>Confirmation</GridTitle>

        <Stack spacing={2}>
          <SelectLabel sx={{ maxWidth: '50%', whiteSpace: 'wrap' }}>
            We sent a code on the provided email. If you didn’t get code please
            check your spam folder or provided email on previous step.
          </SelectLabel>
          <Grid container columns={12} spacing={4}>
            <Grid size={6}>
              <EstimateInput
                type="text"
                label="Code"
                placeholder="------"
                {...codeField}
                onPaste={handlePaste}
                sx={{
                  width: '240px',
                  '& input': {
                    pr: 1,
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: '40px !important',
                    letterSpacing: '0.3em'
                  }
                }}
              />
            </Grid>
            <Grid size={6}>&nbsp;</Grid>
            <Grid size={12}>
              <Stack spacing={2} direction="row" alignItems="center">
                <Button
                  variant="contained"
                  loading={loading}
                  disabled={resendDisabled}
                  onClick={handleResendClick}
                >
                  Resend code
                </Button>
                {resendDisabled && (
                  <Stack spacing={0.5} direction="row" alignItems="center">
                    <HistoryIcon sx={{ fontSize: 20, color: 'text.hint' }} />
                    <Typography variant="body2" color="text.hint">
                      Unlock in {timer}s
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </GridSection>
    </GridContainer>
  )
}

export default ConfirmationStep

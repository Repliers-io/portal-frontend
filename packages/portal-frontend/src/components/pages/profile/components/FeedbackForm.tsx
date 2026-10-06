'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'

import {
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material'

import content from '@configs/content'

import { APIContact, type ErrorCause } from 'services/API'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'

type FeedbackFormValues = {
  reason: string
  selectedOption: string
}

export const FeedbackForm = ({ onSubmit }: { onSubmit?: () => void }) => {
  const { profile } = useUser()
  const { showSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const t = useTranslations('Profile')

  const unsubscribeOptions = [
    { value: 'Bought a house already', label: t('reasonBought') },
    { value: 'Not relevant content', label: t('reasonNotRelevant') },
    { value: 'Too many emails', label: t('reasonTooMany') },
    { value: 'Other', label: t('reasonOther') }
  ]
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FeedbackFormValues>({
    defaultValues: {
      selectedOption: '',
      reason: ''
    }
  })

  const onSubmitForm = async (data: FeedbackFormValues) => {
    const { reason, selectedOption } = data

    const message = `Unsubscribe reason: \n${selectedOption} \n${reason} `

    const { fname, lname, email, phone } = profile

    setLoading(true)
    try {
      await APIContact.addComment({
        pageUrl: window.location.href,
        name: [fname, lname].join(' '),
        email,
        message,
        ...(phone && { phone })
      })
      onSubmit?.()
    } catch (e) {
      showSnackbar((e as ErrorCause)?.cause?.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmitForm)} style={{ width: '100%' }}>
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Typography align="center" pb={4}>
            {t.rich('unsubscribeNotice', {
              email: profile.email,
              site: content.siteName,
              b: (chunks) => <b>{chunks}</b>,
              br: () => <br />
            })}
          </Typography>
          <Typography variant="h4" width="100%">
            {t('tellUsWhy')}
          </Typography>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              {...register('selectedOption')}
              onChange={(e) => setValue('selectedOption', e.target.value)}
            >
              {unsubscribeOptions.map(({ label, value }) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  label={label}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={t('additionalComments')}
            error={!!errors.reason}
            helperText={errors.reason ? t('reasonRequired') : ''}
            {...register('reason')}
          />
          <Button
            size="large"
            type="submit"
            variant="contained"
            loading={loading}
            sx={{ width: { xs: '100%', sm: 140 } }}
          >
            {t('send')}
          </Button>
        </Stack>
      </form>
    </Container>
  )
}

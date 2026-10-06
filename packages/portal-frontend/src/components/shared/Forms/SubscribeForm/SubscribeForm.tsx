'use client'

import { useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Controller, useForm } from 'react-hook-form'

import { Button, Stack, TextField } from '@mui/material'

import { joiResolver } from '@hookform/resolvers/joi'

import { APIContact } from 'services/API'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'

import { LegalText } from '../LegalText'

import { createSubscribeFormSchema, type SubscribeFormValues } from './schema'

type SubscribeFormProps = {
  onSend?: () => void
  submit?: string
  redirectUrl?: string
}

export const SubscribeForm = ({
  onSend,
  submit,
  redirectUrl
}: SubscribeFormProps) => {
  const t = useTranslations('Forms')
  const { showSnackbar } = useSnackbar()
  const { profile } = useUser()

  const schema = useMemo(() => createSubscribeFormSchema(t), [t])

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<SubscribeFormValues>({
    resolver: joiResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      email: profile.email || ''
    }
  })

  useEffect(() => {
    reset({ email: profile.email || '' })
  }, [profile])

  const onSubmit = async (values: SubscribeFormValues) => {
    try {
      await APIContact.subscribeNewsletter(values.email)
      reset()
      onSend?.()

      if (redirectUrl) {
        window.open(redirectUrl, '_blank', 'noopener,noreferrer')
      } else {
        showSnackbar(t('subscribeSuccess'), 'success')
      }
    } catch {
      showSnackbar(t('subscribeError'), 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack
        spacing={2}
        sx={{
          '& .MuiInputBase-root': { bgcolor: 'background.paper' }
        }}
      >
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              placeholder={t('emailPlaceholder')}
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          loading={isSubmitting}
        >
          {submit || t('subscribeButton')}
        </Button>

        <LegalText action={submit || t('subscribeButton')} />
      </Stack>
    </form>
  )
}

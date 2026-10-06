import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Controller, useForm } from 'react-hook-form'

import { Grid, Stack, TextField } from '@mui/material'

import { joiResolver } from '@hookform/resolvers/joi'

import { type LogInRequest, type SignUpRequest } from 'services/API'
import { formatPhoneNumber, formatPhoneNumberAsYouType } from 'utils/formatters'

import { signupSchema } from '../schemas'

import { SignUpButton } from '.'

const SignupFormStep = ({
  visible = false,
  loading,
  disabled,
  onSubmit,
  onChange,
  defaultValues = {}
}: {
  visible?: boolean
  loading?: boolean
  disabled?: boolean
  onSubmit: (params: SignUpRequest) => void
  defaultValues?: Partial<SignUpRequest>
  onChange?: (values: Partial<LogInRequest>) => void
}) => {
  const t = useTranslations('Forms')
  const { fname = '', lname = '', email = '', phone = '' } = defaultValues

  const { control, handleSubmit, setValue, watch } = useForm<SignUpRequest>({
    resolver: joiResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      fname,
      lname,
      email,
      phone: phone ? formatPhoneNumber(phone) : ''
    }
  })

  const watchedEmail = watch('email')
  const watchedPhone = watch('phone')

  useEffect(() => {
    onChange?.({ email: watchedEmail, phone: watchedPhone })
  }, [watchedEmail, watchedPhone])

  useEffect(() => {
    if (watchedEmail !== email)
      setValue('email', email, {
        shouldValidate: true
      })
    if (watchedPhone !== phone)
      setValue(
        'phone',
        // use formatter which accepts uncompleted phone numbers
        phone ? formatPhoneNumberAsYouType(phone) : '',
        { shouldValidate: true }
      )
  }, [email, phone])

  return (
    <Stack
      spacing={4}
      alignItems="center"
      sx={{ display: visible ? 'flex' : 'none', width: '100%', minHeight: 310 }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4} alignItems="center">
          <Grid container display="flex" rowSpacing={2} columnSpacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="fname"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    label={t('firstNameLabel')}
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="lname"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    label={t('lastNameLabel')}
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    type="email"
                    label={t('emailLabel')}
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onFocus={(event) => event.target.select()}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('phoneLabel')}
                    placeholder={t('phonePlaceholder')}
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onFocus={(event) => event.target.select()}
                    onChange={(e) => {
                      field.onChange(formatPhoneNumberAsYouType(e.target.value))
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <SignUpButton loading={loading} disabled={disabled} />
        </Stack>
      </form>
    </Stack>
  )
}

export default SignupFormStep

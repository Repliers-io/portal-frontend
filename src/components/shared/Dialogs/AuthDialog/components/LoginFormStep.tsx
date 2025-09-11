import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button, Stack, TextField } from '@mui/material'

import { joiResolver } from '@hookform/resolvers/joi'
import { GoogleAuthButton } from '@shared/Buttons'

import { type LogInRequest } from 'services/API'
import { formatPhoneNumber, formatPhoneNumberAsYouType } from 'utils/formatters'

import { loginSchema } from '../schemas'

import { OrDivider } from '.'

const LoginFormStep = ({
  visible = true,
  disabled,
  loading,
  defaultValues = {},
  onChange,
  onSubmit
}: {
  visible?: boolean
  disabled?: boolean
  loading?: boolean
  defaultValues?: Partial<LogInRequest>
  onChange?: (values: Partial<LogInRequest>) => void
  onSubmit: (params: LogInRequest) => void
}) => {
  const { email = '', phone = '' } = defaultValues

  const { control, handleSubmit, watch, setValue } = useForm<LogInRequest>({
    resolver: joiResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email,
      phone: phone ? formatPhoneNumber(phone) : ''
    }
  })

  const watchedEmail = watch('email')
  const watchedPhone = watch('phone')

  useEffect(() => {
    if (watchedEmail !== email) setValue('email', email)
    if (watchedPhone !== phone)
      setValue('phone', phone ? formatPhoneNumberAsYouType(phone) : '') // use formatter which accepts uncompleted phone numbers
  }, [email, phone])

  useEffect(() => {
    onChange?.({ email: watchedEmail, phone: watchedPhone })
  }, [watchedEmail, watchedPhone, onChange])

  return (
    <Stack
      spacing={4}
      sx={{ display: visible ? 'flex' : 'none', width: '100%', minHeight: 310 }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4} alignItems="center">
          <Stack alignItems="center" width="100%">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="text"
                  label="Email"
                  disabled={disabled}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onFocus={(event) => event.target.select()}
                />
              )}
            />
            <OrDivider />
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone number"
                  placeholder="(555) 555-1234"
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
          </Stack>
          <Stack alignItems="center">
            <Button
              type="submit"
              size="large"
              variant="contained"
              loading={loading}
              disabled={disabled || loading}
              sx={{ width: 200 }}
            >
              Continue
            </Button>
            <OrDivider />
            <GoogleAuthButton />
          </Stack>
        </Stack>
      </form>
    </Stack>
  )
}

export default LoginFormStep

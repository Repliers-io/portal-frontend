import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button, Grid2, Stack, TextField } from '@mui/material'

import { joiResolver } from '@hookform/resolvers/joi'

import { type LogInRequest, type SignUpRequest } from 'services/API'
import { formatPhoneNumber, formatPhoneNumberAsYouType } from 'utils/formatters'

import { signupSchema } from '../schemas'

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
          <Grid2 container display="flex" rowSpacing={2} columnSpacing={2}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Controller
                name="fname"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    label="First name"
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Controller
                name="lname"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    label="Last name"
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid2>
            <Grid2 size={12}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    type="email"
                    label="Email"
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onFocus={(event) => event.target.select()}
                  />
                )}
              />
            </Grid2>
            <Grid2 size={12}>
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
            </Grid2>
          </Grid2>
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
        </Stack>
      </form>
    </Stack>
  )
}

export default SignupFormStep

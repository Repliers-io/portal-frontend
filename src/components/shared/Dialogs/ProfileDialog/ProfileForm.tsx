'use client'

import { Controller, type SubmitHandler, useForm } from 'react-hook-form'

import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material'

import { joiResolver } from '@hookform/resolvers/joi'

import { AndroidSwitch, SelectLabel } from 'components/atoms'
import { DateLabel } from 'components/atoms'

import type { ApiUserProfile } from 'services/API'
import { useFeatures } from 'providers/FeaturesProvider'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'
import { formatPhoneNumberAsYouType } from 'utils/formatters'
import { sanitizePhoneNumber } from 'utils/properties/sanitizers'

import schema from './schema'

const ProfileForm = ({
  embedded = false,
  onSubmit,
  onCancel
}: {
  embedded?: boolean
  onSubmit?: () => void
  onCancel?: () => void
}) => {
  const features = useFeatures()
  const { showSnackbar } = useSnackbar()
  const { profile, loading, logged, update } = useUser()

  const { fname, lname, phone, preferences } = profile

  const {
    control,
    handleSubmit,
    formState: { errors }
    // setValue
  } = useForm<Partial<ApiUserProfile>>({
    mode: 'onBlur',
    resolver: joiResolver(schema),
    values: {
      fname: fname || '',
      lname: lname || '',
      phone: sanitizePhoneNumber(phone),
      preferences: {
        sms: preferences?.sms ?? false,
        email: preferences?.email ?? false
      }
    }
  })

  const onFormSubmit: SubmitHandler<Partial<ApiUserProfile>> = async (data) => {
    const { value: validated } = schema.validate({
      fname: data.fname,
      lname: data.lname,
      phone: sanitizePhoneNumber(data.phone),
      preferences: {
        sms: data.preferences?.sms,
        email: data.preferences?.email
      }
    })

    const success = await update(validated)

    if (success) {
      showSnackbar('User has been updated', 'success')
      onSubmit?.()
    } else {
      showSnackbar('An error occurred while saving the user.', 'error')
    }
  }

  return (
    <>
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2} width="100%">
          {profile.createdOn && (
            <Box>
              <Typography fontWeight={500}>Registered on</Typography>
              <Typography color="text.hint" pt={1}>
                <DateLabel value={profile.createdOn} />
              </Typography>
            </Box>
          )}
          <Stack direction="row" spacing={2} width="100%">
            <Box flex={1}>
              <SelectLabel>First Name</SelectLabel>
              <Controller
                name="fname"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    {...field}
                    error={!!errors.fname}
                    helperText={errors.fname?.message}
                  />
                )}
              />
            </Box>

            <Box flex={1}>
              <SelectLabel>Last Name</SelectLabel>
              <Controller
                name="lname"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    {...field}
                    error={!!errors.lname}
                    helperText={errors.lname?.message}
                  />
                )}
              />
            </Box>
          </Stack>
          <Stack direction="row" spacing={2} width="100%">
            <Box flex={1}>
              <SelectLabel>Email</SelectLabel>
              <TextField fullWidth value={profile.email} disabled />
            </Box>

            <Box flex={1}>
              <SelectLabel>Contact Phone</SelectLabel>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    {...field}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    onChange={(e) => {
                      field.onChange(
                        formatPhoneNumberAsYouType(e.target.value, field.value)
                      )
                    }}
                  />
                )}
              />
            </Box>
          </Stack>
          {features.messaging && (
            <Box
              sx={{
                p: 2,
                mt: 2,
                borderRadius: 2,
                bgcolor: 'background.default'
              }}
            >
              <Stack
                spacing={2}
                direction="row"
                alignItems="center"
                justifyContent="space-around"
              >
                <Typography fontWeight={500}>Notifications</Typography>
                <FormControlLabel
                  label="Email"
                  disabled={!logged}
                  control={
                    <Controller
                      name="preferences.email"
                      control={control}
                      render={({ field }) => (
                        <AndroidSwitch {...field} checked={field.value} />
                      )}
                    />
                  }
                />

                <FormControlLabel
                  label="SMS"
                  disabled={!logged}
                  control={
                    <Controller
                      name="preferences.sms"
                      control={control}
                      render={({ field }) => (
                        <AndroidSwitch {...field} checked={field.value} />
                      )}
                    />
                  }
                />
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            size="large"
            color="primary"
            variant="contained"
            loading={loading}
            onClick={handleSubmit(onFormSubmit)}
            sx={{ flex: 1, minWidth: embedded ? 192 : 124 }}
          >
            Save
          </Button>
          {!embedded && (
            <Button
              size="large"
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
              sx={{ flex: 1, minWidth: 124 }}
            >
              Cancel
            </Button>
          )}
        </Stack>
      </DialogActions>
    </>
  )
}

export default ProfileForm

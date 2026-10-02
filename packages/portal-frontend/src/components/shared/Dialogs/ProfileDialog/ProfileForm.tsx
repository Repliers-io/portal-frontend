'use client'

import { useTranslations } from 'next-intl'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Box, DialogContent, Stack, Typography } from '@mui/material'

import { joiResolver } from '@hookform/resolvers/joi'

import { DateLabel } from 'components/atoms'

import type { ApiUserProfile } from 'services/API'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'
import { formatPhoneNumberAsYouType } from 'utils/formatters'
import { sanitizePhoneNumber } from 'utils/listings/sanitizers'

import {
  FormSubmitBar,
  NotificationsBar,
  ProfileReadonlyField,
  ProfileTextField
} from './components'
import schema from './schema'

export const ProfileForm = ({
  embedded = false,
  onSubmit,
  onCancel
}: {
  embedded?: boolean
  onSubmit?: () => void
  onCancel?: () => void
}) => {
  const { showSnackbar } = useSnackbar()
  const { profile, update } = useUser()
  const t = useTranslations()

  const { fname, lname, phone, preferences } = profile

  const { control, handleSubmit } = useForm<Partial<ApiUserProfile>>({
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
    const sanitizedPhone = sanitizePhoneNumber(data.phone) || undefined

    const { value: validated } = schema.validate({
      fname: data.fname,
      lname: data.lname,
      phone: sanitizedPhone,
      preferences: {
        sms: data.preferences?.sms,
        email: data.preferences?.email
      }
    })

    const success = await update(validated)

    if (success) {
      showSnackbar(t('Dialogs.Profile.updatedSuccess'), 'success')
      onSubmit?.()
    } else {
      showSnackbar(t('Dialogs.Profile.updatedError'), 'error')
    }
  }

  return (
    <>
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2} width="100%">
          {profile.createdOn && (
            <Box>
              <Typography fontWeight={500}>
                {t('Dialogs.Profile.registeredOn')}
              </Typography>
              <Typography color="text.hint" pt={1}>
                <DateLabel value={profile.createdOn} />
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={2} width="100%">
            <ProfileTextField
              name="fname"
              control={control}
              label={t('Forms.firstNameLabel')}
            />
            <ProfileTextField
              name="lname"
              control={control}
              label={t('Forms.lastNameLabel')}
            />
          </Stack>

          <Stack direction="row" spacing={2} width="100%">
            <ProfileReadonlyField
              label={t('Forms.emailLabel')}
              value={profile.email}
            />
            <ProfileTextField
              name="phone"
              control={control}
              label={t('Dialogs.Profile.contactPhoneLabel')}
              formatter={formatPhoneNumberAsYouType}
            />
          </Stack>

          <NotificationsBar control={control} />
        </Stack>
      </DialogContent>

      <FormSubmitBar
        embedded={embedded}
        onSave={handleSubmit(onFormSubmit)}
        onCancel={onCancel}
      />
    </>
  )
}

import { type Control } from 'react-hook-form'

import { Box, Stack, Typography } from '@mui/material'

import features from '@configs/features'

import type { ApiUserProfile } from 'services/API'
import { useUser } from 'providers/UserProvider'

import { ProfileSwitchField } from './ProfileSwitchField'

type NotificationsBarProps = {
  control: Control<Partial<ApiUserProfile>>
}

export const NotificationsBar = ({ control }: NotificationsBarProps) => {
  const { logged } = useUser()

  if (!features.messaging) return null

  return (
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
        <ProfileSwitchField
          name="preferences.email"
          control={control}
          label="Email"
          disabled={!logged}
        />
        <ProfileSwitchField
          name="preferences.sms"
          control={control}
          label="SMS"
          disabled={!logged}
        />
      </Stack>
    </Box>
  )
}

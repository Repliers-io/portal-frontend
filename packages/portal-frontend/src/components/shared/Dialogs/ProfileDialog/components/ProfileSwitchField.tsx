import { type Control, Controller, type FieldPath } from 'react-hook-form'

import { FormControlLabel } from '@mui/material'

import { AndroidSwitch } from 'components/atoms'

import type { ApiUserProfile } from 'services/API'

type ProfileFormValues = Partial<ApiUserProfile>

type ProfileSwitchFieldProps = {
  name: FieldPath<ProfileFormValues>
  control: Control<ProfileFormValues>
  label: string
  disabled?: boolean
}

export const ProfileSwitchField = ({
  name,
  control,
  label,
  disabled
}: ProfileSwitchFieldProps) => (
  <FormControlLabel
    label={label}
    disabled={disabled}
    control={
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <AndroidSwitch {...field} checked={!!field.value} />
        )}
      />
    }
  />
)

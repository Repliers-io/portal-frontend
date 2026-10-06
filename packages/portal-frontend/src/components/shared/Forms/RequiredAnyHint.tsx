'use client'

import { useTranslations } from 'next-intl'
import { type Control, type FieldValues, useFormState } from 'react-hook-form'

import { FormHelperText } from '@mui/material'

import { useRequiredGroups } from './FormRequirements'
import { requiredAnyType } from './groupResolver'

// Speaks for a `requiredAny` group, and only when the group is unmet — the fields
// themselves stay quiet about it, since a group member carries no asterisk.
export const RequiredAnyHint = <TValues extends FieldValues>({
  control
}: {
  control: Control<TValues>
}) => {
  const t = useTranslations('Forms')
  const groups = useRequiredGroups()
  const { errors } = useFormState({ control })

  const fieldErrors = errors as Record<string, { type?: string } | undefined>
  const unmet = groups.some((group) =>
    group.some((field) => fieldErrors[field]?.type === requiredAnyType)
  )

  if (!unmet) return null

  return (
    <FormHelperText error sx={{ mt: 0.5 }}>
      {t('emailOrPhoneRequired')}
    </FormHelperText>
  )
}

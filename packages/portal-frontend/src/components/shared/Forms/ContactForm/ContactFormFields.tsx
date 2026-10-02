'use client'

import { useTranslations } from 'next-intl'

import { Stack } from '@mui/material'

import { formatPhoneNumberAsYouType } from 'utils/formatters'

import { FormField } from '../FormField'
import { RequiredAnyHint } from '../RequiredAnyHint'

import { type ContactFormFieldsProps } from './types'

const pairSx = { flex: 1, minWidth: 240 }

export const ContactFormFields = ({
  control,
  showMessage = true,
  labels = false
}: ContactFormFieldsProps) => {
  const t = useTranslations('Forms')

  return (
    <Stack spacing={2}>
      <FormField
        name="name"
        control={control}
        labelAbove
        label={labels ? t('nameLabel') : undefined}
        placeholder={t('namePlaceholder')}
        fullWidth
      />

      {/* The hint belongs to the pair, so it sits inside this group rather than
          becoming another row of the outer Stack. */}
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          <FormField
            name="email"
            control={control}
            labelAbove
            label={labels ? t('emailLabel') : undefined}
            placeholder={t('emailPlaceholder')}
            containerSx={pairSx}
            fullWidth
          />

          <FormField
            name="phone"
            control={control}
            labelAbove
            type="tel"
            formatter={formatPhoneNumberAsYouType}
            label={labels ? t('phoneLabel') : undefined}
            placeholder={t('phonePlaceholder')}
            containerSx={pairSx}
            fullWidth
          />
        </Stack>

        <RequiredAnyHint control={control} />
      </Stack>

      {showMessage && (
        <FormField
          name="message"
          control={control}
          labelAbove
          label={labels ? t('messageLabel') : undefined}
          placeholder={t('messagePlaceholder')}
          multiline
          rows={4}
          fullWidth
        />
      )}
    </Stack>
  )
}

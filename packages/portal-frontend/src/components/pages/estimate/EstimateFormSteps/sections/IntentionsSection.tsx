import React from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

import { Stack } from '@mui/material'
import Grid from '@mui/material/Grid'

import type { FormValues, IntentionsType } from '@configs/estimate'
import { intentionsMapping } from '@configs/estimate'

import { EstimateRadioGroup, GridSection, GridTitle } from '../components'

export const IntentionsSection = () => {
  const t = useTranslations('Estimates.form')
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<FormValues>()
  const value = watch('data.salesIntentions.sellingTimeline')
  const error = errors.data?.salesIntentions?.sellingTimeline?.message

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(
      'data.salesIntentions.sellingTimeline',
      event.target.value as IntentionsType
    )
  }

  return (
    <GridSection>
      <GridTitle>{t('intentions.title')}</GridTitle>
      <Grid size={12}>
        <Stack spacing={2}>
          <EstimateRadioGroup
            label={t('intentions.timeline')}
            name="data.salesIntentions.sellingTimeline"
            value={value}
            error={!!error}
            helperText={error}
            options={intentionsMapping}
            onChange={handleChange}
          />
        </Stack>
      </Grid>
    </GridSection>
  )
}

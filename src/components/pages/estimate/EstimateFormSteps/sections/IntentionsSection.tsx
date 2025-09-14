import React from 'react'
import { useFormContext } from 'react-hook-form'

import { Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'

import type { FormValues, IntentionsType } from '@configs/estimate'
import { intentionsMapping } from '@configs/estimate'

import { EstimateRadioGroup, GridSection, GridTitle } from '../components'

const IntentionsSection = () => {
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
      <GridTitle>When would you like to sell your home?</GridTitle>
      <Grid size={12}>
        <Stack spacing={2}>
          <EstimateRadioGroup
            label="When are you looking to sell?"
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

export default IntentionsSection

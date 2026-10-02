import React from 'react'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

import Grid from '@mui/material/Grid'

import {
  EstimateDatepicker,
  EstimateInput,
  GridSection,
  GridTitle
} from '../components'
import { useFormDatepicker, useFormField } from '../hooks'

export const MortgageSection = () => {
  const t = useTranslations('Estimates.form')

  return (
    <GridSection>
      <GridTitle>{t('mortgage.title')}</GridTitle>
      <Grid size={{ xs: 12, sm: 6 }}>
        <EstimateInput
          min={0}
          prefix="$"
          englishNumber
          label={t('mortgage.purchasePrice')}
          {...useFormField('data.purchasePrice')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <EstimateDatepicker
          label={t('mortgage.purchaseDate')}
          maxDate={dayjs()}
          views={['year', 'month', 'day']}
          {...useFormDatepicker('data.purchaseDate')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <EstimateInput
          min={0}
          prefix="$"
          englishNumber
          label={t('mortgage.mortgageBalance')}
          {...useFormField('data.mortgage.balance')}
        />
      </Grid>
    </GridSection>
  )
}

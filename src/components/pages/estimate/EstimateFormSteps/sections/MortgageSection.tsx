import React from 'react'
import dayjs from 'dayjs'

import Grid from '@mui/material/Grid2'

import {
  EstimateDatepicker,
  EstimateInput,
  GridSection,
  GridTitle
} from '../components'
import { useFormDatepicker, useFormField } from '../hooks'

const MortgageSection = () => {
  return (
    <GridSection>
      <GridTitle>Home Equity Calculator</GridTitle>
      <Grid size={{ xs: 12, sm: 6 }}>
        <EstimateInput
          min={0}
          prefix="$"
          englishNumber
          label="Purchase price"
          {...useFormField('data.purchasePrice')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <EstimateDatepicker
          label="Purchase date"
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
          label="Mortgage balance"
          {...useFormField('data.mortgage.balance')}
        />
      </Grid>
    </GridSection>
  )
}

export default MortgageSection

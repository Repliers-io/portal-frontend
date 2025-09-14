import React from 'react'
import { useFormContext } from 'react-hook-form'

import Grid from '@mui/material/Grid2' // Grid version 2

import { defaultValues } from '@configs/estimate'

import { Asterisk, SelectLabel } from 'components/atoms'

import { EstimateInput, GridSection, GridTitle } from '../components'
import { useFormField } from '../hooks'

const sanitizeString = (input: string): string => {
  return (
    input
      // split by comma or newline
      .split(/,\s*|\n/)
      .map((str) => str.trim())
      .filter(Boolean)
      .join(', ')
  )
}

const ExpensesSection = () => {
  const { watch, setValue } = useFormContext()

  const condoType = watch('listingType') === 'condo'

  const maintenanceField = useFormField('condominium.fees.maintenance')

  return (
    <>
      <GridSection>
        <GridTitle>Expenses</GridTitle>

        <Grid size={{ xs: 12, sm: 6 }}>
          <EstimateInput
            prefix="$"
            englishNumber
            label={
              <>
                Annual Property Taxes <Asterisk />
              </>
            }
            {...useFormField('taxes.annualAmount')}
          />
        </Grid>

        {condoType && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <EstimateInput
              prefix="$"
              englishNumber
              label={
                <>
                  Maintenance Fee <Asterisk />
                </>
              }
              {...maintenanceField}
            />
          </Grid>
        )}
      </GridSection>
      <GridSection>
        <GridTitle>Extras</GridTitle>

        <Grid size={{ xs: 12, sm: 9 }}>
          <SelectLabel sx={{ whiteSpace: 'wrap' }}>
            Additional Features (hardwood floors, stone countertops, hot tub,
            professional landscaping, etc)
          </SelectLabel>
          <EstimateInput
            type="text"
            sx={{ width: { xs: '100%', sm: 'calc(66% - 8px)' } }}
            {...useFormField('details.extras', {
              onBlur: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = sanitizeString(e.target.value)
                const defaultValue = defaultValues.details.extras
                // value can't be empty by default
                setValue('details.extras', value || defaultValue)
              }
            })}
          />
        </Grid>
      </GridSection>
    </>
  )
}

export default ExpensesSection

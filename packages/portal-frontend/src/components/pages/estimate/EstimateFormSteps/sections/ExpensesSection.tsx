import React from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

import Grid from '@mui/material/Grid' // Grid version 2

import estimateConfig from '@configs/estimate'

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

export const ExpensesSection = () => {
  const t = useTranslations('Estimates.form')
  const { watch, setValue } = useFormContext()

  const condoType = watch('listingType') === 'condo'

  const maintenanceField = useFormField('condominium.fees.maintenance')

  const showMaintenance = condoType || Number(maintenanceField.value) > 0

  return (
    <>
      <GridSection>
        <GridTitle>{t('expenses.title')}</GridTitle>

        <Grid size={{ xs: 12, sm: 6 }}>
          <EstimateInput
            prefix="$"
            englishNumber
            label={
              <>
                {t('expenses.annualPropertyTaxes')} <Asterisk />
              </>
            }
            {...useFormField('taxes.annualAmount')}
          />
        </Grid>

        {showMaintenance && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <EstimateInput
              prefix="$"
              englishNumber
              label={
                <>
                  {t('expenses.maintenanceFee')} <Asterisk />
                </>
              }
              {...maintenanceField}
            />
          </Grid>
        )}
      </GridSection>
      <GridSection>
        <GridTitle>{t('extras.title')}</GridTitle>

        <Grid size={{ xs: 12, sm: 9 }}>
          <SelectLabel sx={{ whiteSpace: 'wrap' }}>
            {t('extras.additionalFeatures')}
          </SelectLabel>
          <EstimateInput
            type="text"
            sx={{ width: { xs: '100%', sm: 'calc(66% - 8px)' } }}
            {...useFormField('details.extras', {
              onBlur: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = sanitizeString(e.target.value)
                const defaultValue = estimateConfig.defaultValues.details.extras
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

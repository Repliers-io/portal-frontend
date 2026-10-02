import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

import Grid from '@mui/material/Grid' // Grid version 2

import estimateConfig from '@configs/estimate'
import { type EstimateListingType } from '@configs/estimate'

const { defaultsCondo, defaultsResidential } = estimateConfig

import { useEstimate } from 'providers/EstimateProvider'

import {
  GridContainer,
  GridSection,
  GridTitle,
  PropertyTypeSelect,
  QuantityPicker
} from './components'
import { useFormField } from './hooks'

const BasicDetailsStep = () => {
  const t = useTranslations('Estimates.form')
  const { preloading, historyData, estimateData } = useEstimate()
  const { watch, setValue } = useFormContext()

  const numberOptions = { valueAsNumber: true }
  const condoType = watch('listingType') === 'condo'

  const listingTypeField = useFormField<EstimateListingType>('listingType')
  const numBedroomsField = useFormField('details.numBedrooms', numberOptions)
  const numBathroomsField = useFormField('details.numBathrooms', numberOptions)
  const numGarageField = useFormField('details.numGarageSpaces', numberOptions)
  const numParkingField = useFormField(
    'details.numParkingSpaces',
    numberOptions
  )

  // NOTE: We react to the listingType change to set the default values for the
  // condo and back to residential if the user switches between those two types.

  // This is needed because the default values are set in the estimate provider
  // from `defaultResidentialDetails` object

  useEffect(() => {
    // the state of the provider when we create new estimate from scratch
    if (!estimateData && !historyData?.details) {
      const defaults = condoType ? defaultsCondo : defaultsResidential

      // TODO: extend this to extract keys out of the defaultDetails object
      // and set them all
      setValue('details.sqft', defaults.details.sqft)
      setValue('details.style', defaults.details.style)
    }
  }, [condoType, estimateData, historyData])

  return (
    <GridContainer>
      <GridSection>
        <GridTitle>{t('basicDetails.propertyType')}</GridTitle>
        <Grid size={12}>
          <PropertyTypeSelect loading={preloading} {...listingTypeField} />
        </Grid>
      </GridSection>
      <GridSection>
        <GridTitle>{t('basicDetails.numbers')}</GridTitle>
        <Grid size={{ xs: 6, sm: 3 }}>
          <QuantityPicker
            loading={preloading}
            label={t('basicDetails.bedrooms')}
            {...numBedroomsField}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <QuantityPicker
            loading={preloading}
            label={t('basicDetails.bathrooms')}
            {...numBathroomsField}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <QuantityPicker
            min={0}
            max={30}
            loading={preloading}
            label={t('basicDetails.parkingSpaces')}
            {...numParkingField}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {!preloading && !condoType && (
            <QuantityPicker
              min={0}
              loading={preloading}
              label={t('basicDetails.garageSpaces')}
              {...numGarageField}
            />
          )}
        </Grid>
      </GridSection>
    </GridContainer>
  )
}

export default BasicDetailsStep

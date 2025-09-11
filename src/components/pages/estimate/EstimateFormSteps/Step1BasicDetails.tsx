import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import Grid from '@mui/material/Grid2' // Grid version 2

import { defaultsCondo, defaultsResidential } from '@configs/estimate'
import { type EstimateListingType } from '@configs/estimate'

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
        <GridTitle>Property type</GridTitle>
        <Grid size={12}>
          <PropertyTypeSelect loading={preloading} {...listingTypeField} />
        </Grid>
      </GridSection>
      <GridSection>
        <GridTitle>Numbers</GridTitle>
        <Grid size={{ xs: 6, sm: 3 }}>
          <QuantityPicker
            loading={preloading}
            label="Bedrooms"
            {...numBedroomsField}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <QuantityPicker
            loading={preloading}
            label="Bathrooms"
            {...numBathroomsField}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <QuantityPicker
            min={0}
            max={30}
            loading={preloading}
            label="Parking Spaces"
            {...numParkingField}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {!preloading && !condoType && (
            <QuantityPicker
              min={0}
              loading={preloading}
              label="Garage Spaces"
              {...numGarageField}
            />
          )}
        </Grid>
      </GridSection>
    </GridContainer>
  )
}

export default BasicDetailsStep

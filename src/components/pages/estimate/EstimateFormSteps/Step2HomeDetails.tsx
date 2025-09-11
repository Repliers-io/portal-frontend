import { useFormContext } from 'react-hook-form'

import Grid from '@mui/material/Grid2' // Grid version 2

import { Asterisk } from 'components/atoms'

import { useEstimate } from 'providers/EstimateProvider'
import { useSelectOptions } from 'providers/SelectOptionsProvider'
import useBreakpoints from 'hooks/useBreakpoints'

import {
  EstimateInput,
  EstimateSelect,
  EstimateYearSelect,
  GridContainer,
  GridSection,
  GridTitle
} from './components'
import { useFormField } from './hooks'

const HomeDetailsStep = () => {
  const { desktop } = useBreakpoints()

  const { options, loading } = useSelectOptions()
  const { preloading } = useEstimate()
  const { watch } = useFormContext()

  const condoType = watch('listingType') === 'condo'

  const swimmingPoolKey = 'details.swimmingPool'
  const exterior1Key = 'details.exteriorConstruction1'
  const amenitiesKey = 'condominium.amenities'
  const exposureKey = 'condominium.exposure'
  const basement1Key = 'details.basement1'
  const heatingKey = 'details.heating'
  const yearsKey = 'details.yearBuilt'
  const styleKey = 'details.style'
  const petsKey = 'condominium.pets'

  const swimmingPoolField = useFormField(swimmingPoolKey)
  const exterior1Field = useFormField(exterior1Key)
  const amenitiesField = useFormField(amenitiesKey)
  const exposureField = useFormField(exposureKey)
  const basement1Field = useFormField(basement1Key)
  const heatingField = useFormField(heatingKey)
  const yearsField = useFormField(yearsKey)
  const styleField = useFormField(styleKey)
  const petsField = useFormField(petsKey)

  return (
    <GridContainer>
      <GridSection>
        {desktop && <GridTitle>Home Characteristics</GridTitle>}
        <Grid size={{ xs: 12, sm: 6 }}>
          <EstimateSelect
            label={
              <>
                Style of Home <Asterisk />
              </>
            }
            items={options[styleKey]}
            loading={loading}
            {...styleField}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EstimateSelect
            multiple
            label="Exterior"
            items={options[exterior1Key]}
            loading={loading}
            {...exterior1Field}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <EstimateInput
            suffix="Sqft"
            englishNumber
            label={
              <>
                Square Footage <Asterisk />
              </>
            }
            {...useFormField('details.sqft')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <EstimateSelect
            multiple
            label="Heating"
            items={options[heatingKey]}
            loading={loading}
            {...heatingField}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <EstimateYearSelect
            items={options[yearsKey]}
            loading={loading}
            {...yearsField}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {!preloading && (
            <>
              {condoType ? (
                <EstimateSelect
                  label="Exposure"
                  items={options[exposureKey]}
                  loading={loading}
                  {...exposureField}
                />
              ) : (
                <EstimateSelect
                  multiple
                  label="Basement Details"
                  items={options[basement1Key]}
                  loading={loading}
                  {...basement1Field}
                />
              )}
            </>
          )}
        </Grid>
        {!preloading && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              {condoType ? (
                <EstimateSelect
                  label="Pets"
                  items={options[petsKey]}
                  loading={loading}
                  {...petsField}
                />
              ) : (
                <EstimateSelect
                  label="Swimming Pool"
                  items={options[swimmingPoolKey]}
                  loading={loading}
                  {...swimmingPoolField}
                />
              )}
            </Grid>
            {condoType && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <EstimateSelect
                  multiple
                  label="Amenities"
                  items={options[amenitiesKey]}
                  loading={loading}
                  {...amenitiesField}
                />
              </Grid>
            )}
          </>
        )}
      </GridSection>
    </GridContainer>
  )
}

export default HomeDetailsStep

import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined'
import { Box, Button, Stack, TextField } from '@mui/material'

import { type ApiAddress } from 'services/API'
import { useEstimate } from 'providers/EstimateProvider'
import useAnalytics from 'hooks/useAnalytics'
import useClientSide from 'hooks/useClientSide'
import { toRem } from 'utils/theme'

import { handleErrorBlur } from '../../../utils'

import { AddressAutocomplete, AddressMap } from '.'

const AddressSection = ({
  showMap = true,
  agentRole = false,
  /**
   * Optional callback function to handle address submission.
   * It overrides the default behavior of proceeding to the next step (`nextStep()`).
   * The parent component is responsible for any further actions, including navigation
   * or closing a window if this section is used in an embedded context.
   */
  onSubmit,
  onMapReady
}: {
  showMap?: boolean
  agentRole?: boolean
  onSubmit?: (address: ApiAddress, unitNumber: string) => void
  onMapReady?: (ready: boolean) => void
}) => {
  const trackEvent = useAnalytics()
  const clientSide = useClientSide()
  const { loading, nextStep, resetForm } = useEstimate()
  const {
    watch,
    control,
    trigger,
    setValue,
    formState: { errors }
  } = useFormContext()

  const point = watch('point')
  const address = watch('address')
  const unitNumber = watch('unitNumber')
  const listingType = watch('listingType')

  const errorAddress = !!errors.address
  const errorUnitNumber = !!errors.unitNumber

  const addressMap = point && !errorAddress && address

  const sx = {
    '& .MuiInputBase-root': {
      p: 0,
      bgcolor: '#fff !important',
      '& .MuiInputBase-input': {
        p: 2,
        height: 16,
        lineHeight: toRem(16)
      }
    },
    '& .MuiAutocomplete-clearIndicator': {
      color: 'primary.main'
    }
  }

  useEffect(() => {
    const mapReady = Boolean(addressMap)
    onMapReady?.(mapReady)
    if (mapReady) {
      const { city, neighborhood } = addressMap || {}
      trackEvent('estimate_form_address', { city, neighborhood })
    }
  }, [addressMap])

  return (
    <Stack spacing={2} direction="column">
      <Stack
        spacing={2}
        width={{ xs: '100%', sm: 'auto' }}
        sx={{
          gap: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '2fr 1fr'
          }
        }}
      >
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <AddressAutocomplete
              {...field}
              onChange={(value: ApiAddress | null, reason: string) => {
                field.onChange(value)
                setValue('unitNumber', '')
                if (reason === 'clear') {
                  resetForm()
                } else {
                  trigger('address')
                }
              }}
              onBlur={handleErrorBlur(field, errors)}
              disabled={!clientSide || loading}
              helperText={errors.address?.message?.toString()}
              error={errorAddress}
              sx={sx}
            />
          )}
        />

        <Controller
          name="unitNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              placeholder="Apt # (optional)"
              disabled={!clientSide || loading}
              onBlur={handleErrorBlur(field, errors)}
              helperText={errors.unitNumber?.message?.toString()}
              error={errorUnitNumber}
              sx={sx}
            />
          )}
        />
      </Stack>

      {showMap && addressMap && (
        <Box
          sx={{
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: '#e9e6e0'
          }}
        >
          <ForestOutlinedIcon
            sx={{
              zIndex: 1,
              top: '50%',
              left: '50%',
              fontSize: 96,
              m: '-48px 0 0 -48px',
              position: 'absolute',
              color: 'common.white',
              opacity: loading ? 0 : 1
            }}
          />

          <AddressMap
            point={point}
            loading={loading}
            listingType={listingType}
            {...(agentRole
              ? { width: 712, height: 400 }
              : { width: 560, height: 200 })}
          />
        </Box>
      )}

      {!agentRole && (
        <Button
          fullWidth
          size="large"
          variant="contained"
          sx={{ minWidth: { xs: '100%', sm: 180 } }}
          disabled={!address || errorAddress || errorUnitNumber}
          loading={loading || !clientSide}
          onClick={() => {
            onSubmit?.(address, unitNumber)
            nextStep()
          }}
        >
          Get Started
        </Button>
      )}
    </Stack>
  )
}

export default AddressSection

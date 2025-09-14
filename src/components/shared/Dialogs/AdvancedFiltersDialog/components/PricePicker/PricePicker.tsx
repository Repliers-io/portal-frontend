'use client'

import React, { useEffect, useState } from 'react'

import { Box, CircularProgress, Slider, Stack, Typography } from '@mui/material'

import { getBucketIndex } from 'utils/filters'
import { formatPrice, toSafeNumber } from 'utils/formatters'

import PriceBars from './PriceBars'
import PriceChart from './PriceChart'

type PricePickerProps = {
  values: (number | string)[]
  minRange?: number
  showLabels?: boolean
  variant?: 'chart' | 'bars'
  buckets: { [key: string]: number }
  onChange?: (val: number[]) => void
}

const PricePicker = ({
  values,
  buckets,
  showLabels = true,
  variant = 'chart',
  minRange = 2, // minimum steps in the picker range allowed
  onChange
}: PricePickerProps) => {
  const bucketKeys = Object.keys(buckets)
  const lastIndex = bucketKeys.length - 1

  const [pickerMin, setPickerMin] = useState(0)
  const [pickerMax, setPickerMax] = useState(lastIndex)

  const min = 0
  const max = lastIndex
  const step = 1

  const formatLabel = (index: number) => {
    const price = bucketKeys[index]
    return `${formatPrice(price)}${index === lastIndex ? '+' : ''}`
  }

  const handleChange = (
    _event: Event,
    position: number | number[],
    thumb: number
  ) => {
    let [positionMin, positionMax] = position as number[]

    // prevent min picker from going out of bounds
    if (positionMin >= lastIndex - minRange) positionMin = lastIndex - minRange
    // prevent max picker from going to zero
    if (positionMax < minRange) positionMax = minRange

    if (thumb === 0 && positionMax < positionMin + minRange) {
      // min (first) picker moved to the right
      positionMax = positionMin + minRange
    } else if (positionMin > positionMax - minRange) {
      // max (second) picker moved to the left
      positionMin = positionMax - minRange
    }

    if (positionMin === pickerMin && positionMax === pickerMax) return

    setPickerMin(positionMin)
    setPickerMax(positionMax)
  }

  const handleChangeCommitted = () => {
    const minPrice = parseFloat(bucketKeys[pickerMin])
    // return 0 if max price thumb reaches the end
    const maxPrice =
      pickerMax === lastIndex ? 0 : parseFloat(bucketKeys[pickerMax])

    onChange?.([minPrice, maxPrice])
  }

  useEffect(() => {
    const [minValue, maxValue] = values
    setPickerMin(getBucketIndex(toSafeNumber(minValue), bucketKeys))
    setPickerMax(
      !maxValue ? lastIndex : getBucketIndex(toSafeNumber(maxValue), bucketKeys)
    )
  }, [values, buckets])

  if (!bucketKeys.length)
    return (
      <Box
        sx={{
          height: 88,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    )

  return (
    <Box>
      <Stack spacing={1} direction="row" alignItems="flex-end" sx={{ pb: 2 }}>
        {showLabels && (
          <Typography color="text.hint" variant="body2">
            min
          </Typography>
        )}
        <Box sx={{ px: 1, flex: 1 }}>
          <Box sx={{ position: 'relative', mb: -2 }}>
            {variant === 'bars' && (
              <PriceBars buckets={buckets} min={pickerMin} max={pickerMax} />
            )}
            {variant === 'chart' && (
              <PriceChart buckets={buckets} min={pickerMin} max={pickerMax} />
            )}

            <Slider
              min={min}
              max={max}
              step={step}
              disableSwap
              onChange={handleChange}
              onChangeCommitted={handleChangeCommitted}
              value={[pickerMin, pickerMax]}
              valueLabelFormat={formatLabel}
              valueLabelDisplay={showLabels ? 'on' : 'off'}
              sx={{
                bottom: '17px',
                p: '0 !important',

                '& .MuiSlider-rail': {
                  opacity: 1,
                  height: '2px',
                  color: 'divider'
                },
                '& .MuiSlider-track': {
                  height: '2px',
                  border: 'none',
                  bgcolor: 'primary.main'
                },
                '& .MuiSlider-thumb': {
                  bgcolor: 'primary.main',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '50% 50%'
                },
                '& .MuiSlider-valueLabelOpen': {
                  top: '46px !important',
                  right: '-20px !important',
                  width: '40px',
                  background: 'none',
                  color: 'common.black',
                  fontSize: '0.625rem'
                }
              }}
            />
          </Box>
        </Box>
        {showLabels && (
          <Typography color="text.hint" variant="body2">
            max
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

export default PricePicker

'use client'

import { useEffect, useMemo, useState } from 'react'

import { Box, CircularProgress, Stack, Typography } from '@mui/material'

import filtersConfig from '@configs/filters'

import { SelectLabel } from 'components/atoms'

import { getBucketIndex, getBucketIndexCeil } from 'utils/filters'
import {
  formatEnglishNumber,
  formatPrice,
  toSafeNumber
} from 'utils/formatters'

import PriceBars from './PriceBars'
import PriceChart from './PriceChart'
import { PriceInputs } from './PriceInputs'
import { PriceSlider } from './PriceSlider'

type PricePickerProps = {
  label?: string
  values: (number | string)[]
  minRange?: number
  variant?: 'chart' | 'bars'
  buckets: { [key: string]: number }
  onChange?: (val: number[]) => void
}

// A histogram this dense draws its bars thin enough for the value labels to crowd
// each other; below it the bars are wide, the thumbs stay apart, and the labels are
// left centred.
const denseBarCount = 20

// Bars between the thumbs below which the two value labels would overlap.
const labelGapBars = 3

export const PricePicker = ({
  label = '',
  values,
  buckets,
  variant = 'chart',
  minRange = 2, // minimum steps in the picker range allowed
  onChange
}: PricePickerProps) => {
  const { priceInputs } = filtersConfig

  const bucketKeys = useMemo(() => Object.keys(buckets), [buckets])
  const lastIndex = bucketKeys.length - 1

  const [pickerMin, setPickerMin] = useState(0)
  const [pickerMax, setPickerMax] = useState(lastIndex)
  // the inputs read the exact filter prices, and the thumbs' bucket prices mid-drag
  const [prices, setPrices] = useState(() => values.map(toSafeNumber))

  const min = 0
  const max = lastIndex
  const step = 1

  // Each value label is a 40px box centred on its thumb, so the pair collides once
  // the thumbs sit a few bars apart. Closer than that, the min label hangs off the
  // left of its pin and the max off the right — the two boxes then meet edge to edge
  // even with both thumbs on the same bar.
  // PriceBars draws one bar per gap between buckets, so `lastIndex` is the bar count.
  const labelsOverlap =
    lastIndex > denseBarCount && pickerMax - pickerMin <= labelGapBars

  const formatLabel = (index: number) => {
    const price = bucketKeys[index]
    return `${formatPrice(price)}${index === lastIndex ? '+' : ''}`
  }

  // An empty field leaves its end open, so it shows the histogram's edge the
  // thumbs' labels read at rest — blank until the buckets load.
  const placeholders = bucketKeys.length
    ? [
        formatEnglishNumber(bucketKeys[0]),
        `${formatEnglishNumber(bucketKeys[lastIndex])}+`
      ]
    : ['', '']

  const bucketPrices = (minIndex: number, maxIndex: number) => [
    parseFloat(bucketKeys[minIndex]),
    // return 0 if max price thumb reaches the end
    maxIndex === lastIndex ? 0 : parseFloat(bucketKeys[maxIndex])
  ]

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
    setPrices(bucketPrices(positionMin, positionMax))
  }

  // A text field keeps `:focus-visible`, and the browser hands it on to the thumb MUI
  // focuses on press — dropping the field's focus first keeps a pointer drag free of
  // the keyboard focus ring.
  const handlePointerDown = () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur()
  }

  const handleChangeCommitted = () => {
    onChange?.(bucketPrices(pickerMin, pickerMax))
  }

  useEffect(() => {
    const [minValue, maxValue] = values.map(toSafeNumber)
    setPickerMin(getBucketIndex(minValue, bucketKeys))
    setPickerMax(
      !maxValue ? lastIndex : getBucketIndexCeil(maxValue, bucketKeys)
    )
    setPrices([minValue, maxValue])
  }, [values, bucketKeys, lastIndex])

  return (
    <Box>
      {label && <SelectLabel>{label}</SelectLabel>}
      {!bucketKeys.length ? (
        <Box
          sx={{
            height: 88, // matches the Stack below so the picker height is stable
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1} direction="row" alignItems="flex-end" sx={{ pb: 2 }}>
          {!priceInputs && (
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

              <PriceSlider
                min={min}
                max={max}
                step={step}
                disableSwap
                onPointerDown={handlePointerDown}
                onChange={handleChange}
                onChangeCommitted={handleChangeCommitted}
                value={[pickerMin, pickerMax]}
                valueLabelFormat={formatLabel}
                valueLabelDisplay={priceInputs ? 'off' : 'on'}
                sx={{
                  bottom: '17px',
                  p: '0 !important',

                  '& .MuiSlider-valueLabelOpen': {
                    top: '46px !important',
                    right: '-20px !important',
                    width: '40px',
                    background: 'none',
                    color: 'common.black',
                    fontSize: '0.625rem'
                  },

                  // Moving the box alone leaves the price back under the pin: the
                  // label is a centred flex row, so the text has to be pushed to the
                  // outer edge too, and the 12px MUI pads the inner side with —
                  // a third of the 40px box — has to go with it.
                  ...(labelsOverlap && {
                    '& .MuiSlider-thumb[data-index="0"] .MuiSlider-valueLabelOpen':
                      {
                        right: '0 !important',
                        paddingRight: '2px !important',
                        justifyContent: 'flex-end'
                      },
                    '& .MuiSlider-thumb[data-index="1"] .MuiSlider-valueLabelOpen':
                      {
                        left: '0 !important',
                        right: 'auto !important',
                        paddingLeft: '2px !important',
                        justifyContent: 'flex-start'
                      }
                  })
                }}
              />
            </Box>
          </Box>
          {!priceInputs && (
            <Typography color="text.hint" variant="body2">
              max
            </Typography>
          )}
        </Stack>
      )}
      {priceInputs && (
        <PriceInputs
          values={prices}
          placeholders={placeholders}
          onChange={(val) => onChange?.(val)}
        />
      )}
    </Box>
  )
}

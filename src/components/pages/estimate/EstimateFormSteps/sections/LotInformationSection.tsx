import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { Box, FormControl, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2' // Grid version 2

import SelectLabel from 'components/atoms/SelectLabel'

import { calcAreaAcres } from 'utils/numbers'

import {
  EstimateInput,
  EstimateRadioGroup,
  GridSection,
  GridTitle
} from '../components'
import { useFormField } from '../hooks'

type LotShape = 'rectangle' | 'irregular'

const lotShapeOptions: [LotShape, string][] = [
  ['rectangle', 'Standard (Rectangular Shape)'],
  ['irregular', 'Irregular (Custom Shape)']
]

const LotInformationSection = () => {
  const { watch, setValue } = useFormContext()
  const lotWidth = watch('lot.width')
  const lotDepth = watch('lot.depth')
  const lotAcres = watch('lot.acres')

  const [shape, setShape] = useState<LotShape>(() => {
    // If all fields are empty, default to rectangle
    if (!lotWidth && !lotDepth && !lotAcres) return 'rectangle'
    // If width and depth exist, use rectangle
    return lotDepth && lotWidth ? 'rectangle' : 'irregular'
  })

  const lotSizesRef = useRef({
    width: lotWidth,
    depth: lotDepth
  })
  const prevShapeRef = useRef<LotShape>(shape)
  const areaRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (lotDepth && lotWidth)
      setValue('lot.acres', calcAreaAcres(lotDepth, lotWidth))
  }, [lotWidth, lotDepth])

  useEffect(() => {
    // rectangle → irregular: store current, clear fields, focus area
    if (prevShapeRef.current === 'rectangle' && shape === 'irregular') {
      lotSizesRef.current = { width: lotWidth, depth: lotDepth }
      setValue('lot.width', '')
      setValue('lot.depth', '')
      areaRef.current?.focus()
    }
    // irregular → rectangle: restore stored
    if (prevShapeRef.current === 'irregular' && shape === 'rectangle') {
      setValue('lot.width', lotSizesRef.current.width)
      setValue('lot.depth', lotSizesRef.current.depth)
    }
    prevShapeRef.current = shape
  }, [shape, lotWidth, lotDepth, setValue])

  return (
    <GridSection>
      <GridTitle>Lot Information</GridTitle>

      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl
          fullWidth
          sx={{ '& .MuiStack-root': { gap: { xs: 1, sm: 4 } } }}
        >
          <EstimateRadioGroup
            label="Lot Shape"
            name="lot.shape"
            value={shape}
            options={lotShapeOptions}
            onChange={(e, newValue) => setShape(newValue as LotShape)}
          />
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth>
          <Stack spacing={4}>
            <Box>
              <SelectLabel>Lot Size</SelectLabel>
              <Stack
                spacing={1.2 /* 1.3 + 1.3 + 'x' symbol = ~4 */}
                direction="row"
                justifyContent="space-between"
              >
                <EstimateInput
                  suffix="Ft"
                  placeholder="Width"
                  disabled={shape === 'irregular'}
                  {...useFormField('lot.width')}
                />
                <Box
                  color="divider"
                  sx={{ display: 'flex', height: 48, alignItems: 'center' }}
                >
                  &#x2715;
                </Box>
                <EstimateInput
                  suffix="Ft"
                  placeholder="Depth"
                  disabled={shape === 'irregular'}
                  {...useFormField('lot.depth')}
                />
              </Stack>
            </Box>
            <EstimateInput
              suffix="Acres"
              label="Lot Area"
              inputRef={areaRef}
              disabled={shape === 'rectangle'}
              {...useFormField('lot.acres')}
            />
          </Stack>
        </FormControl>
      </Grid>
    </GridSection>
  )
}

export default LotInformationSection

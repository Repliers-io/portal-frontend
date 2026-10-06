import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

import { Box, FormControl, Stack } from '@mui/material'
import Grid from '@mui/material/Grid' // Grid version 2

import { SelectLabel } from 'components/atoms'

import { calcAreaAcres } from 'utils/numbers'

import {
  EstimateInput,
  EstimateRadioGroup,
  GridSection,
  GridTitle
} from '../components'
import { useFormField } from '../hooks'

type LotShape = 'rectangle' | 'irregular'

export const LotInformationSection = ({ title }: { title?: string }) => {
  const t = useTranslations('Estimates.form')
  const lotShapeOptions: [LotShape, string][] = [
    ['rectangle', t('lotInformation.shapeStandard')],
    ['irregular', t('lotInformation.shapeIrregular')]
  ]
  const { watch, setValue, clearErrors } = useFormContext()
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
      clearErrors(['lot.width', 'lot.depth'])
      areaRef.current?.focus()
    }
    // irregular → rectangle: restore stored
    if (prevShapeRef.current === 'irregular' && shape === 'rectangle') {
      setValue('lot.width', lotSizesRef.current.width)
      setValue('lot.depth', lotSizesRef.current.depth)
      clearErrors(['lot.acres'])
    }
    prevShapeRef.current = shape
  }, [shape, lotWidth, lotDepth, setValue, clearErrors])

  return (
    <GridSection>
      <GridTitle>{title || t('lotInformation.title')}</GridTitle>

      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl
          fullWidth
          sx={{ '& .MuiStack-root': { gap: { xs: 1, sm: 4 } } }}
        >
          <EstimateRadioGroup
            label={t('lotInformation.lotShape')}
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
              <SelectLabel>{t('lotInformation.lotSize')}</SelectLabel>
              <Stack
                spacing={1.2 /* 1.3 + 1.3 + 'x' symbol = ~4 */}
                direction="row"
                justifyContent="space-between"
              >
                <EstimateInput
                  suffix="Ft"
                  placeholder={t('lotInformation.width')}
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
                  placeholder={t('lotInformation.depth')}
                  disabled={shape === 'irregular'}
                  {...useFormField('lot.depth')}
                />
              </Stack>
            </Box>
            <EstimateInput
              suffix="Acres"
              label={t('lotInformation.lotArea')}
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

'use client'

import { Box, Typography } from '@mui/material'

import { PricePicker } from '@shared/Dialogs/AdvancedFiltersDialog/components/PricePicker'

import { FilterChip } from './FilterChip'
import { usePriceFilter } from './usePriceFilter'

export const PriceFilter = ({ size }: { size: 'medium' | 'small' }) => {
  const {
    open,
    minPrice,
    maxPrice,
    priceValue,
    priceLabel,
    buckets,
    handleOpen,
    handleClose,
    handlePriceChange
  } = usePriceFilter()

  return (
    <FilterChip
      label={
        <Box
          component="span"
          data-price-label
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'left'
          }}
        >
          <Typography variant="body1" component="span" sx={{ fontWeight: 400 }}>
            {priceLabel}
          </Typography>
          {priceValue && (
            <Typography
              component="span"
              sx={{ fontWeight: 700, fontSize: '0.75rem', ml: 1 }}
            >
              {priceValue}
            </Typography>
          )}
        </Box>
      }
      size={size}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      unset={!priceValue}
      sx={{ width: 140, pr: 1.25 }}
      paperSx={{
        width: 416,
        p: 3,
        // narrower than the dialog, so the price inputs keep a tighter gap
        '& [data-price-inputs]': { gap: 2 }
      }}
    >
      <PricePicker
        variant="bars"
        buckets={buckets}
        values={[minPrice, maxPrice]}
        onChange={handlePriceChange}
      />
    </FilterChip>
  )
}

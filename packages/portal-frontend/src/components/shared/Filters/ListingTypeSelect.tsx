import { type SxProps } from '@mui/material'

import filtersConfig, { type ListingType } from '@configs/filters'

import { FilterSelect } from 'components/atoms/FilterSelect'

import { useListingTypeLabel } from './useListingTypeLabel'

const { listingTypes } = filtersConfig

type Props = {
  size: 'medium' | 'small'
  disabled?: boolean
  sx?: SxProps
  multiSelect?: boolean
  value: ListingType | ListingType[] | undefined
  onChange: (value: ListingType | ListingType[]) => void
}

export const ListingTypeSelect = ({
  size,
  sx,
  disabled,
  multiSelect,
  value,
  onChange
}: Props) => {
  const formatListingType = useListingTypeLabel()

  return (
    <FilterSelect
      size={size}
      items={listingTypes}
      value={value}
      fallback="allListings"
      exclusiveItem="allListings"
      formatItem={formatListingType}
      onChange={onChange as (value: ListingType | ListingType[]) => void}
      multiSelect={multiSelect}
      changeAfterClose={multiSelect}
      disabled={disabled}
      sx={{ width: { xs: 130, sm: 148 }, ...sx }}
    />
  )
}

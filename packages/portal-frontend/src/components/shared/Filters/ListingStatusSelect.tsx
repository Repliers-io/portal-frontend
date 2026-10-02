import React from 'react'
import { useTranslations } from 'next-intl'

import { Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material'

import filtersConfig, { type ListingStatus } from '@configs/filters'

import { FilterSelect } from 'components/atoms/FilterSelect'

import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

const singleEntries =
  filtersConfig.listingStatuses as unknown as ListingStatus[]
const multiEntries = singleEntries.filter((s) => s !== 'all')

export const ListingStatusSelect = ({
  size,
  value,
  multiSelect,
  variant = 'select',
  disabled,
  onChange
}: {
  size: 'medium' | 'small'
  multiSelect?: boolean
  variant?: 'group' | 'select'
  disabled?: boolean
  value: ListingStatus | ListingStatus[]
  onChange: (newValue: ListingStatus | ListingStatus[]) => void
}) => {
  const clientSide = useClientSide()
  const { mobile } = useBreakpoints()
  const t = useTranslations('MapFilters.listingStatuses')

  const formatStatus = (status: ListingStatus) => t(status)

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width:
            !multiSelect && variant === 'group' && !mobile
              ? { xs: 110, sm: 313, md: 377, lg: 441 }
              : { xs: 110, sm: 124 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )
  }

  if (!multiSelect && variant === 'group' && !mobile) {
    const singleValue: ListingStatus = Array.isArray(value)
      ? value[0] || 'active'
      : value || 'active'

    const handleChange = (
      _e: React.MouseEvent<HTMLElement>,
      newValue: ListingStatus
    ) => onChange(newValue)

    return (
      <ToggleButtonGroup
        exclusive
        disabled={disabled}
        value={singleValue}
        onChange={handleChange}
        sx={{
          width: { sm: 313, md: 377, lg: 441 },
          '& .MuiToggleButton-root': { px: { md: 3, lg: 4 } }
        }}
      >
        {singleEntries.map((status) => (
          <ToggleButton
            key={status}
            value={status}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {formatStatus(status)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    )
  }

  return (
    <FilterSelect
      size={size}
      items={singleEntries}
      multiItems={multiEntries}
      value={value}
      fallback="active"
      exclusiveItem="rent"
      formatItem={formatStatus}
      onChange={onChange}
      multiSelect={multiSelect}
      changeAfterClose={multiSelect}
      disabled={disabled}
      sx={{ width: { xs: 110, sm: 124 } }}
    />
  )
}

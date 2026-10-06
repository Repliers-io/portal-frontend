import { useTranslations } from 'next-intl'

import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'

import { type ListingStatus, type ListingType } from '@configs/filters'
import { ListingTypeSelect } from '@shared/Filters'

import { getLocationUrl } from 'utils/urls'

const statuses = ['active', 'rent'] as const satisfies readonly ListingStatus[]

export const TypeStatusGroup = ({
  size,
  listingType,
  listingStatus,
  city,
  hood,
  onTypeChange,
  createFiltersArray
}: {
  size: 'small' | 'medium'
  listingType: ListingType | ListingType[] | undefined
  listingStatus: ListingStatus | ListingStatus[] | undefined
  city?: string
  hood?: string
  onTypeChange: (value: ListingType | ListingType[]) => void
  createFiltersArray: (opts: { status: ListingStatus }) => string[]
}) => {
  const t = useTranslations('MapFilters.listingStatuses')

  return (
    <Stack
      spacing={1.5}
      direction="row"
      sx={size === 'small' ? { width: '100%' } : undefined}
    >
      <ListingTypeSelect
        size={size}
        value={listingType!}
        onChange={onTypeChange}
        sx={{
          ...(size === 'small' && { flex: 0.7 })
        }}
      />

      <ToggleButtonGroup
        exclusive
        size={size}
        value={listingStatus}
        sx={{
          ...(size === 'small' && { flex: 1 }),
          '& .MuiToggleButton-root': {
            fontWeight: 400,
            ...(size === 'small' ? { px: 0, flex: 1 } : { px: { md: 3 } })
          }
        }}
      >
        {statuses.map((key) => (
          <ToggleButton
            key={key}
            value={key}
            href={getLocationUrl({
              city,
              hood,
              filters: createFiltersArray({ status: key })
            })}
          >
            {t(key)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  )
}

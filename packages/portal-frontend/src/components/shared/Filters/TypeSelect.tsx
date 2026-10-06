'use client'

import { useTranslations } from 'next-intl'

import { Skeleton } from '@mui/material'

import { FilterSelect } from 'components/atoms/FilterSelect'

import { type TransactionType } from 'services/Search'
import { useSearch } from 'providers/SearchProvider'
import useClientSide from 'hooks/useClientSide'

const items: TransactionType[] = ['sale', 'lease']

// Sets `filters.type` directly instead of `listingStatus` because movesmartly models
// sale/lease and active/sold as two independent axes:
//
//   TypeSelect  → filters.type = 'sale' | 'lease'   (transaction axis)
//   SoldRangeFilter → filters.soldRange              (time/status axis)
//
// Using listingStatus would collapse both axes into a single enum, making
// "sold leases" inexpressible — listingStatus.sold() hardcodes type: 'sale'.
// The listingStatus.active() transformer still provides status/lastStatus defaults;
// the explicit filters.type overrides only its type output.
export const TypeSelect = ({ size }: { size: 'medium' | 'small' }) => {
  const { filters, addFilters } = useSearch()
  const clientSide = useClientSide()
  const t = useTranslations('MapFilters.transactionType')

  const value = (filters.type as TransactionType) || 'sale'

  const handleChange = (next: TransactionType | TransactionType[]) => {
    const v = Array.isArray(next) ? next[0] : next
    addFilters({ type: v, minPrice: 0, maxPrice: 0 })
  }

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: 110,
          height: size === 'small' ? 32 : 38,
          borderRadius: '999px'
        }}
      />
    )
  }

  return (
    <FilterSelect
      size={size}
      items={items}
      value={value}
      fallback="sale"
      formatItem={(v) => t(v)}
      onChange={handleChange}
      requireSelection
      sx={{ minWidth: 110 }}
    />
  )
}

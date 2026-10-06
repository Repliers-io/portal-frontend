'use client'

import { useEffect, useEffectEvent, useState } from 'react'
import { useTranslations } from 'next-intl'

import { useSearch } from 'providers/SearchProvider'
import { formatShortPrice } from 'utils/formatters'

import { fetchPriceBuckets, useSearchArea } from './priceBuckets'

const buildPriceValue = (min: number, max: number): string | null => {
  if (!min && !max) return null
  if (min && !max) return `${formatShortPrice(min)}+`
  if (!min && max) return `<${formatShortPrice(max)}`

  const minStr = formatShortPrice(min)
  const maxStr = formatShortPrice(max)
  const minLast = minStr.at(-1)!
  const maxLast = maxStr.at(-1)!
  const sameSuffix = minLast === maxLast && (minLast === 'K' || minLast === 'M')

  return sameSuffix
    ? `$${minStr.slice(1, -1)}-${maxStr.slice(1, -1)}${minLast}`
    : `${minStr}-${maxStr.slice(1)}`
}

export const usePriceFilter = ({
  changeAfterClose = false
}: {
  changeAfterClose?: boolean
} = {}) => {
  const t = useTranslations('MapFilters')
  const { filters, addFilters } = useSearch()
  const searchArea = useSearchArea()

  const [open, setOpen] = useState(false)
  const [buckets, setBuckets] = useState<Record<string, number>>({})
  const [pendingPrice, setPendingPrice] = useState({ minPrice: 0, maxPrice: 0 })
  const [priceChanged, setPriceChanged] = useState(false)
  const minPrice =
    changeAfterClose && priceChanged
      ? pendingPrice.minPrice
      : (filters.minPrice ?? 0)
  const maxPrice =
    changeAfterClose && priceChanged
      ? pendingPrice.maxPrice
      : (filters.maxPrice ?? 0)
  const displayPriceValue = buildPriceValue(minPrice, maxPrice)

  const priceLabel = displayPriceValue ? t('price') : t('anyPrice')

  const fetchBuckets = async () => {
    if (!searchArea.bounds) return
    try {
      const priceBuckets = await fetchPriceBuckets(filters, searchArea)
      if (priceBuckets) setBuckets(priceBuckets)
    } catch {
      // request aborted or disabled — ignore silently
    }
  }

  // When listingStatus or type changes while the popover is closed, pre-clear the buckets
  // so the next open immediately shows a loading spinner instead of stale sale/lease data.
  const clearClosed = useEffectEvent(() => {
    if (!open) setBuckets({})
  })
  useEffect(() => {
    clearClosed()
  }, [filters.listingStatus, filters.type])

  const handleOpen = () => {
    setOpen(true)
    void fetchBuckets()
  }

  const handleClose = () => {
    setOpen(false)
    if (changeAfterClose && priceChanged) addFilters(pendingPrice)
    setPendingPrice({ minPrice: 0, maxPrice: 0 })
    setPriceChanged(false)
  }

  const handlePriceChange = ([minPrice, maxPrice]: number[]) => {
    if (changeAfterClose) {
      setPendingPrice({ minPrice, maxPrice })
      setPriceChanged(true)
    } else addFilters({ minPrice, maxPrice })
  }

  return {
    open,
    minPrice,
    maxPrice,
    priceValue: displayPriceValue,
    priceLabel,
    buckets,
    handleOpen,
    handleClose,
    handlePriceChange
  }
}

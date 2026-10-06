import filtersConfig, { type ListingType } from '@configs/filters'

import { useSearch } from 'providers/SearchProvider'
import { getBlockedStyleValues } from 'utils/filters'

export const useListingTypeChange = () => {
  const { filters, addFilters } = useSearch()

  return (value: ListingType | ListingType[]) => {
    const blocked = getBlockedStyleValues(value, filtersConfig.styleOptions)
    const nextStyle = filters.style?.filter((v) => !blocked.includes(v))
    addFilters({
      listingType: value,
      ...(nextStyle?.length !== filters.style?.length
        ? { style: nextStyle?.length ? nextStyle : undefined }
        : {})
    })
  }
}

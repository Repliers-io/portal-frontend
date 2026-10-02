import { useTranslations } from 'next-intl'

import { formatUnionKey, sentenceCase } from 'utils/strings'

/**
 * Resolve a listing-type key to its display label from the shared
 * `MapFilters.listingTypes` i18n namespace, falling back to a humanized key.
 * Shared by the map / location type selectors and the estimate property-type
 * picker so their labels stay in sync.
 */
export const useListingTypeLabel = () => {
  const t = useTranslations('MapFilters.listingTypes')

  return (type: string) => {
    const key = type as Parameters<typeof t.has>[0]
    return t.has(key) ? t(key) : sentenceCase(formatUnionKey(type))
  }
}

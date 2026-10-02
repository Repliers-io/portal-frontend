import { useTranslations } from 'next-intl'

import listingsConfig from '@configs/listings'

import { type ApiLastStatus } from 'services/API'

// The listing page hands its 40X template whatever `fetchListing` threw, so the
// value is only shaped like this once the throw came from the API client.
type ListingError = {
  status?: number
  data?: { userMessage?: string; message?: string }
}

const errorCodes = ['403', '404', '410', '429', '500']

const statusLabel = (message?: string, divider = '. ') => {
  if (!message) return null
  const code = message.includes(divider) ? message.split(divider)[1] : message
  return listingsConfig.statusLabels[code as ApiLastStatus]
}

/** Status code and the copy every Listing40X template renders under it, so the
 *  tenant forks share one vocabulary and differ only in layout. */
export const useListingError = (error?: unknown) => {
  const t = useTranslations('Templates.listingError')
  const { status = 404, data } = (error ?? {}) as ListingError
  const code = errorCodes.includes(String(status)) ? String(status) : '404'
  const lastStatus = statusLabel(data?.userMessage || data?.message)

  // 410 names what happened to the listing; with no status to name, the
  // sentence loses its object, so the generic copy reads better.
  if (code === '410' && !lastStatus) return { status, subtitle: t('404') }

  return {
    status,
    subtitle: t(code, { lastStatus: lastStatus?.toLowerCase() ?? '' })
  }
}

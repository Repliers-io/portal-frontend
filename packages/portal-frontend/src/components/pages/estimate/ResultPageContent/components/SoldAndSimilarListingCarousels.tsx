import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

import { Box } from '@mui/material'

import filtersConfig from '@configs/filters'
import i18nConfig from '@configs/i18n'
import listingsConfig from '@configs/listings'
import searchConfig from '@configs/search'
import { ListingCarousel } from '@shared/Listing'

import { APIEstimate, type ApiListing, type ApiQueryParams } from 'services/API'
import { useEstimate } from 'providers/EstimateProvider'
import { toSafeString } from 'utils/formatters'

const { statusFilters } = filtersConfig
const comparablesCount = 8
const minSoldDate = dayjs().subtract(2, 'month').format(i18nConfig.dateFormat)

export const SoldAndSimilarListingCarousels = () => {
  const t = useTranslations('Estimates')
  const { estimateData } = useEstimate()
  const [similars, setSimilars] = useState<ApiListing[]>([])
  const [recentlySolds, setRecentlySolds] = useState<ApiListing[]>([])
  const { watch } = useFormContext()

  const listingType = watch('listingType')

  const {
    estimateHigh = 0,
    estimateLow = 0,
    payload: { map, address } = {}
  } = estimateData || {}

  useEffect(() => {
    if (!estimateData || !address) return

    const compParams: Partial<ApiQueryParams> = {
      radius: 10,
      sortBy: 'distanceAsc',
      resultsPerPage: comparablesCount,
      minPrice: Math.round(estimateLow),
      maxPrice: Math.round(estimateHigh),
      lat: toSafeString(map?.latitude),
      long: toSafeString(map?.longitude),
      ...(listingType && { listingType })
    }

    APIEstimate.fetchComparables({
      ...compParams,
      minSoldDate,
      ...statusFilters.sold,
      boardId: searchConfig.defaultBoardId
    })
      .then((listings) => setRecentlySolds(listings))
      .catch((e) => console.error('RecentlySolds::Error fetching data', e))

    APIEstimate.fetchComparables({
      ...compParams,
      ...statusFilters.active,
      boardId: searchConfig.defaultBoardId
    })
      .then((listings) => setSimilars(listings))
      .catch((e) => console.error('Similars::Error fetching data', e))
  }, [estimateData, address])

  if (!recentlySolds.length && !similars.length) return null

  return (
    <Box mb={-3}>
      {recentlySolds.length > 0 && (
        <ListingCarousel
          title={t('recentlySoldComparables')}
          listings={recentlySolds}
          openInNewTab={listingsConfig.linksInNewTab}
        />
      )}
      {similars.length > 0 && (
        <ListingCarousel
          title={t('similarProperties')}
          listings={similars}
          openInNewTab={listingsConfig.linksInNewTab}
        />
      )}
    </Box>
  )
}

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'

import { Box } from '@mui/material'

import { dateFormat } from '@configs/i18n'
import { defaultBoardId, vowBoardId } from '@configs/search'
import { PropertyCarousel } from '@shared/Property'

import { APIEstimate, type ApiQueryParams, type Property } from 'services/API'
import { useEstimate } from 'providers/EstimateProvider'
import { toSafeString } from 'utils/formatters'

const comparablesCount = 8
const minSoldDate = dayjs().subtract(2, 'month').format(dateFormat)

const SoldAndSimilarPropertyCarousels = () => {
  const { estimateData } = useEstimate()
  const [similars, setSimilars] = useState<Property[]>([])
  const [recentlySolds, setRecentlySolds] = useState<Property[]>([])
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
      status: 'U',
      lastStatus: ['Sld'],
      boardId: vowBoardId
    })
      .then((listings) => setRecentlySolds(listings))
      .catch((e) => console.error('RecentlySolds::Error fetching data', e))

    APIEstimate.fetchComparables({
      ...compParams,
      status: 'A',
      boardId: defaultBoardId
    })
      .then((listings) => setSimilars(listings))
      .catch((e) => console.error('Similars::Error fetching data', e))
  }, [estimateData, address])

  if (!recentlySolds.length && !similars.length) return null

  return (
    <Box mb={-3}>
      {recentlySolds.length > 0 && (
        <PropertyCarousel
          title="Recently Sold Comparables"
          properties={recentlySolds}
          openInNewTab
        />
      )}
      {similars.length > 0 && (
        <PropertyCarousel
          title="Similar Properties"
          properties={similars}
          openInNewTab
        />
      )}
    </Box>
  )
}

export default SoldAndSimilarPropertyCarousels

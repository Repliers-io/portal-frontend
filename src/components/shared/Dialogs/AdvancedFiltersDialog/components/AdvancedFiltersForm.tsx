'use client'

import { useEffect, useState } from 'react'

import { Box, DialogContent, DialogTitle } from '@mui/material'

import { defaultAdvancedFilters } from '@configs/filters'
import { DialogCloseButton } from '@shared/Dialogs/components'

import SearchService, {
  type Filters,
  getMapPolygon,
  getMapRectangle
} from 'services/Search'
import { useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { mergeBuckets } from 'utils/filters'

import { dialogName } from '../AdvancedFiltersDialog'

import {
  AdvancedFiltersMenu,
  AdvancedFiltersTab,
  AiQualityFiltersTab,
  FilterActions
} from '.'

const AdvancedFiltersForm = ({
  onSubmit,
  onReset
}: {
  onSubmit: () => void
  onReset: () => void
}) => {
  const [tab, setTab] = useState('advanced')
  const { position } = useMapOptions()
  const { filters, polygon, setFilters, resetFilters } = useSearch()

  const intialState = {
    ...defaultAdvancedFilters,
    ...filters
  }

  const [dialogState, setDialogState] = useState<Filters>(intialState)

  const handleDialogStateChange = (mutation: Partial<Filters>) => {
    setDialogState({
      ...dialogState,
      ...mutation
    })
  }

  const [count, setCount] = useState<number | null>(null)

  // Price Buckets
  const [priceBuckets, setPriceBuckets] = useState({})

  const handleReset = () => {
    resetFilters()
    setDialogState(defaultAdvancedFilters)
    onReset?.()
  }

  const handleSubmit = () => {
    setFilters({ ...filters, ...dialogState })
    onSubmit?.()
  }

  const fetchBucketsCounts = async () => {
    const { bounds } = position
    if (!bounds) return

    // remove price filters from the request
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { minPrice, maxPrice, ...requestFilters } = filters

    const response = await SearchService.fetch({
      ...requestFilters,
      ...dialogState,
      aggregates: 'listPrice',
      ...(polygon ? getMapPolygon(polygon) : getMapRectangle(bounds))
    })
    if (!response) return

    const { aggregates: { listPrice } = {} } = response
    if (!listPrice) return

    const priceBuckets = mergeBuckets(
      filters.listingStatus === 'rent' ? listPrice.lease : listPrice.sale
    )
    setPriceBuckets(priceBuckets)

    const response2 = await SearchService.fetch({
      ...filters,
      ...dialogState,
      ...(polygon ? getMapPolygon(polygon) : getMapRectangle(bounds))
    })
    if (response2) setCount(response2.count)
  }

  useEffect(() => {
    fetchBucketsCounts()
  }, [dialogState])

  const features = useFeatures()

  const { hideDialog } = useDialog(dialogName)

  return (
    <>
      <DialogCloseButton
        onClose={hideDialog}
        sx={features.aiQuality ? { top: 12, right: 12 } : {}}
      />

      {features.aiQuality ? (
        <AdvancedFiltersMenu
          selected={tab}
          onChange={setTab}
          dialogState={dialogState}
        />
      ) : (
        // use regular title/header for dialog window
        <DialogTitle>Advanced Filters</DialogTitle>
      )}

      <DialogContent>
        <Box sx={features.aiQuality ? { py: 2 } : { pb: 2 }}>
          {tab === 'advanced' && (
            <AdvancedFiltersTab
              dialogState={dialogState}
              priceBuckets={priceBuckets}
              onChange={handleDialogStateChange}
            />
          )}

          {tab === 'image' && (
            <AiQualityFiltersTab
              dialogState={dialogState}
              onChange={handleDialogStateChange}
            />
          )}
        </Box>
      </DialogContent>

      <FilterActions
        count={count}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default AdvancedFiltersForm

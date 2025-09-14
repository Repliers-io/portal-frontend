'use client'

import React, { Suspense } from 'react'

import { Box } from '@mui/material'

import { type ListingStatus, type ListingType } from '@configs/filters'
import { AdvancedFiltersDialog, AiSearchDialog } from '@shared/Dialogs'
import { ListingStatusSelect, ListingTypeSelect } from '@shared/Filters'

import { useFeatures } from 'providers/FeaturesProvider'
import { useSearch } from 'providers/SearchProvider'
import useBreakpoints from 'hooks/useBreakpoints'

import {
  AdvancedFiltersButton,
  AiChat,
  // AiQualityButton,
  AiSearchButton,
  AiSpacesSelect,
  AutosuggestionField,
  LayoutSelect,
  MapFiltersBar,
  SaveSearchButton
} from './components'

const DesktopOnly = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: { xs: 'none', md: 'block' } }}>{children}</Box>
)

const MapFilters = () => {
  const features = useFeatures()
  const { mobile } = useBreakpoints()
  const size = mobile ? 'small' : 'medium'

  const { filters, setFilter, addFilters } = useSearch()

  const typeValue = filters.listingType || 'allListings'
  const statusValue = filters.listingStatus || 'all'

  const featureFlags = [
    features.saveSearch,
    features.aiSearch,
    features.aiSpaces,
    features.aiChat
  ]

  const activeFeaturesCount = featureFlags.filter(Boolean).length
  const statusSelectVariant = activeFeaturesCount < 2 ? 'group' : 'select'

  const handleStatusChange = (value: ListingStatus) => {
    if (value === 'rent') {
      addFilters({
        minPrice: 0,
        maxPrice: 0,
        listingStatus: value
        // listingType: 'allListings'
      })
    } else {
      setFilter('listingStatus', value)
    }
  }

  const handleTypeChange = (value: ListingType) =>
    setFilter('listingType', value)

  return (
    <MapFiltersBar rightSlot={<LayoutSelect />}>
      {features.search && features.searchPosition === 'filters' && (
        <AutosuggestionField />
      )}

      <ListingTypeSelect
        size={size}
        value={typeValue}
        onChange={handleTypeChange}
      />

      <ListingStatusSelect
        size={size}
        value={statusValue}
        variant={statusSelectVariant}
        onChange={handleStatusChange}
      />

      <AdvancedFiltersButton size={size} />

      {features.saveSearch && (
        <DesktopOnly>
          <SaveSearchButton size={size} />
        </DesktopOnly>
      )}

      {features.aiSearch && <AiSearchButton size={size} />}

      {/* {features.aiQuality && (
            <DesktopOnly>
              <AiQualityButton size={size} />
            </DesktopOnly>
          )} */}

      {features.aiSpaces && (
        <DesktopOnly>
          <AiSpacesSelect size={size} />
        </DesktopOnly>
      )}

      {features.aiChat && (
        <DesktopOnly>
          <AiChat />
        </DesktopOnly>
      )}
      <Suspense>
        {features.aiSearch && <AiSearchDialog />}
        <AdvancedFiltersDialog />
      </Suspense>
    </MapFiltersBar>
  )
}

export default MapFilters

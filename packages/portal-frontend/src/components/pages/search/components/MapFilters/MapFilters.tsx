/**
 * Search filter bar: status/type selects, location autosuggest, AI search, advanced
 * filters, and save-search. Rendered above MapRoot by MapPageContent.
 */
'use client'

import React, { Suspense } from 'react'

import { Box } from '@mui/material'

import features from '@configs/features'
import filtersConfig, { type ListingStatus } from '@configs/filters'
import searchConfig from '@configs/search'
import { AdvancedFiltersDialog, AiSearchDialog } from '@shared/Dialogs'
import { ListingStatusSelect, ListingTypeSelect } from '@shared/Filters'
import { MapLayoutSwitch } from '@shared/Map'

import { useSearch } from 'providers/SearchProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import { foreignRawReset, rawFieldsFor } from 'utils/filters'

import {
  AdvancedFiltersButton,
  AiSearchButton,
  AiSpacesSelect,
  AutosuggestionField,
  MapFiltersBar,
  SaveSearchButton
} from './components'
import { useListingTypeChange } from './useListingTypeChange'

const DesktopOnly = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: { xs: 'none', md: 'block' } }}>{children}</Box>
)

const hasRent = (v: ListingStatus[]) => v.includes('rent')

const MapFiltersComponent = () => {
  const { mobile } = useBreakpoints()
  const size = mobile ? 'small' : 'medium'

  const { filters, setFilter, addFilters, filtersDisabled } = useSearch()

  const statusValue = filters.listingStatus || 'all'

  const featureFlags = [
    features.saveSearch,
    features.aiSearch,
    features.aiSpaces
  ]

  const activeFeaturesCount = featureFlags.filter(Boolean).length
  const statusSelectVariant = activeFeaturesCount > 0 ? 'select' : 'group'

  const handleStatusChange = (value: ListingStatus | ListingStatus[]) => {
    const prev = [statusValue].flat()
    const next = [value].flat()
    const rentChanged = hasRent(next) !== hasRent(prev)

    if (rentChanged) {
      addFilters({
        minPrice: 0,
        maxPrice: 0,
        ...foreignRawReset(filters, rawFieldsFor({ listingStatus: value })),
        listingStatus: value
      })
    } else {
      setFilter('listingStatus', value)
    }
  }

  const handleTypeChange = useListingTypeChange()

  return (
    <MapFiltersBar rightSlot={<MapLayoutSwitch />}>
      {searchConfig.autosuggestPosition === 'filters' && (
        <AutosuggestionField />
      )}

      <ListingTypeSelect
        size={size}
        value={filters.listingType}
        onChange={handleTypeChange}
        multiSelect={filtersConfig.multiListingType}
        disabled={filtersDisabled}
      />

      <ListingStatusSelect
        size={size}
        value={statusValue}
        variant={statusSelectVariant}
        onChange={handleStatusChange}
        multiSelect={filtersConfig.multiListingStatus}
        disabled={filtersDisabled}
      />

      <AdvancedFiltersButton size={size} />

      {features.saveSearch && (
        <DesktopOnly>
          <SaveSearchButton size={size} />
        </DesktopOnly>
      )}

      {features.aiSpaces && (
        <DesktopOnly>
          <AiSpacesSelect size={size} />
        </DesktopOnly>
      )}

      {features.aiSearch && <AiSearchButton size={size} />}

      <Suspense>
        {features.aiSearch && <AiSearchDialog />}
        <AdvancedFiltersDialog />
      </Suspense>
    </MapFiltersBar>
  )
}

// Memoized: the filter bar has no props and nothing here depends on overlay
// layers, so a layer toggle (which re-renders the MapPageContent parent for URL
// sync) must not reconcile the whole bar.
export const MapFilters = React.memo(MapFiltersComponent)

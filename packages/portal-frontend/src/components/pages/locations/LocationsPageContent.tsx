/**
 * Locations catalog page: mounts LocationProvider and renders LocationsPageLayout
 * (header / filters / footer / listing grid). Listings are server-passed or fetched client-side.
 * Anatomy: docs → product-guide/locations/technical.
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Stack } from '@mui/material'

import locationConfig from '@configs/location'
import searchConfig from '@configs/search'
import { type PopularSearch } from '@defaults/location'

import { type ApiListing, type ApiLocation } from 'services/API'
import { type LocationWithDistance } from 'services/LocationsTree'
import SearchService, { type Filters } from 'services/Search'
import { LocationProvider } from 'providers/LocationProvider'
import { cityGeoFilters } from 'utils/filters'
import { logError } from 'utils/log'

import { LocationFooter } from './components/LocationFooter'
import {
  FiltersList,
  LocationBreadcrumbs,
  LocationFilters,
  LocationHeader,
  LocationListings,
  LocationPagination
} from './components'
import { LocationsPageLayout } from './LocationsPageLayout'

export const LocationsPageContent = ({
  count: initialCount,
  listings: initialListings,
  area,
  hood,
  city,
  cityHasBuildings,
  urlFilters,
  searchFilters,
  areas,
  hoods,
  cities,
  location,
  nearbies,
  searches
}: {
  listings?: ApiListing[]
  count?: number

  area?: string
  hood?: string
  city?: string
  cityHasBuildings?: boolean

  areas: ApiLocation[]
  hoods: ApiLocation[]
  cities: ApiLocation[]
  location?: ApiLocation
  nearbies?: LocationWithDistance[]
  searches?: PopularSearch[] | null

  urlFilters: string[]
  searchFilters: Partial<Filters>
}) => {
  // The route is force-static, so the server sees empty searchParams — the
  // catalog reads ?page/?search here instead. Under force-static this hook is a
  // plain context read and does not opt the page out of static rendering.
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') || undefined

  const [listings, setListings] = useState<ApiListing[]>(initialListings || [])
  const staticCount =
    location?.activeCount ??
    cities.reduce((sum, c) => sum + (c.activeCount ?? 0), 0)
  const [count, setCount] = useState<number>(initialCount ?? staticCount)
  const [loading, setLoading] = useState(!initialListings)

  useEffect(() => {
    // If listings were passed from server, use them
    if (initialListings) return

    // Otherwise fetch on client side
    const fetchListingsOnClient = async () => {
      setLoading(true)
      try {
        // Precise geo-filter: query by the tree-resolved locationId (see
        // searchListingsByLocationId) instead of address strings, which the API
        // expands into the full propertyType list. Falls back to address params
        // when the flag is off or no location resolved.
        const locationId = locationConfig.searchListingsByLocationId
          ? location?.locationId
          : undefined

        const response = await SearchService.fetchListings({
          ...(locationId
            ? { locationId }
            : {
                // Repliers stores `state` per board in different formats (full
                // name vs 2-letter code), so queries use the per-tenant
                // `stateFilter`, not `state` (display) or `stateCode` (URL).
                state: locationConfig.stateFilter,
                area,
                ...(city ? cityGeoFilters(city) : {}),
                neighborhood: hood
              }),
          pageNum: page,
          resultsPerPage: searchConfig.pageSize,
          ...searchFilters,
          ...(search ? { search } : {})
        })
        // A superseded request resolves null: the newer request owns `loading`,
        // so this one must not clear it and flash the empty state.
        if (!response) return
        setListings(response.listings)
        setCount(response.count)
        setLoading(false)
      } catch (error) {
        logError('[LocationsPageContent] Client fetch error:', error)
        setListings([])
        setCount(0)
        setLoading(false)
      }
    }

    fetchListingsOnClient()
  }, [
    initialListings,
    area,
    city,
    hood,
    page,
    search,
    searchFilters,
    location?.locationId
  ])

  return (
    <LocationProvider
      area={area}
      city={city}
      hood={hood}
      count={count}
      listings={listings}
      cityHasBuildings={cityHasBuildings}
      location={location}
      areas={areas}
      cities={cities}
      hoods={hoods}
      nearbies={nearbies}
    >
      <LocationsPageLayout
        header={
          <LocationHeader filters={searchFilters} urlFilters={urlFilters} />
        }
        filters={<LocationFilters loading={loading} filters={searchFilters} />}
        footer={<LocationFooter searches={searches} />}
        content={
          <Stack spacing={4}>
            <LocationListings loading={loading} />

            <Stack spacing={2} alignItems="center">
              {(loading || count > searchConfig.pageSize) && (
                <LocationPagination
                  page={page}
                  count={count}
                  loading={loading}
                />
              )}
              {count > 0 && <LocationBreadcrumbs home={false} />}

              <FiltersList urlFilters={urlFilters} search={search} />
            </Stack>
          </Stack>
        }
      />
    </LocationProvider>
  )
}

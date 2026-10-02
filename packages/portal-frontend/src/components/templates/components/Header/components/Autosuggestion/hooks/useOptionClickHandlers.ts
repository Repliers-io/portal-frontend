import { type RefObject, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type LngLatBounds } from 'mapbox-gl'

import mapConfig from '@configs/map'
import { overlayForLocation, useLocationSelection } from '@shared/Map/hooks'

import {
  type ApiCoords,
  type ApiListing,
  type ApiLocation,
  APILocations
} from 'services/API'
import { type MapboxAddress, MapSearch } from 'services/Map'
import { type TransactionType } from 'services/Search'
import {
  type MapPosition,
  useMapLocations,
  useMapOptions
} from 'providers/MapOptionsProvider'
import { useSearchActions } from 'providers/SearchProvider'
import { getSeoUrl } from 'utils/listings'
import {
  calcBoundsAtZoom,
  calcZoomLevel,
  fitBounds,
  getLngLatCenter,
  getLocationExtent,
  getLocationsBounds,
  getMapUrl,
  toMapboxPoint
} from 'utils/map'

import { getAddressLabel, getLocationLabel, updateQueryParam } from '../utils'

const { mapFlyCurve } = mapConfig

interface UseOptionClickHandlersProps {
  buttonFlyPosition: RefObject<MapPosition>
  inputRef: RefObject<HTMLInputElement | null>
  setOpen: (open: boolean) => void
  setSearchString: (value: string) => void
  type?: TransactionType
}

export const useOptionClickHandlers = ({
  buttonFlyPosition,
  inputRef,
  setOpen,
  setSearchString,
  type
}: UseOptionClickHandlersProps) => {
  const router = useRouter()
  const { setPoint, clearPoint } = useSearchActions()
  const { mapRef, clearEditMode } = useMapOptions()
  const { locations, clearLocations } = useMapLocations()
  const { selectLocations, clearSelection, clearLocationFilters } =
    useLocationSelection()
  const [locationLoading, setLocationLoading] = useState(false)

  const map = mapRef.current

  // Helper function to get or fetch bounds for a location
  const getLocationBounds = useCallback(
    async (location: ApiLocation) => {
      let bounds: LngLatBounds | null = null
      let center = toMapboxPoint(location.map as ApiCoords)
      let zoom = mapConfig.zoom.area

      const localExtent = getLocationExtent(location)
      if (localExtent) {
        return { bounds: localExtent, center, zoom }
      }

      bounds = await APILocations.fetchLocationBounds(location)
      if (map) {
        if (bounds) {
          const locationZoom = calcZoomLevel(map, bounds)
          // NOTE: object' bounds are too big to be the real area,
          // lets fallback to its center point with the default zoom level for areas
          // if (locationZoom < mapConfig.zoom.areaFallback) {
          //   zoom = mapConfig.zoom.areaFallback
          //   bounds = calcBoundsAtZoom(map, center, zoom)
          // } else
          if (locationZoom > mapConfig.zoom.address) {
            // object's bounds are too small, use address zoom level
            zoom = mapConfig.zoom.address
            center = getLngLatCenter(bounds)
            bounds = calcBoundsAtZoom(map, center, zoom)
          }
        } else {
          // no bounds found, use center point with default area zoom
          zoom = mapConfig.zoom.address
          center = toMapboxPoint(location.map as ApiCoords)
          bounds = calcBoundsAtZoom(map, center, zoom)
        }
      }

      return { bounds, center, zoom }
    },
    [map]
  )

  const handleLocationClick = useCallback(
    async (location: ApiLocation) => {
      const query = getLocationLabel(location)

      setOpen(false)
      setSearchString(query)
      setLocationLoading(true)
      clearEditMode() // Exit draw mode when selecting a location
      clearPoint() // an address marker and a selected location are mutually exclusive

      // Get bounds for the location
      const { bounds, center, zoom } = await getLocationBounds(location)

      if (map) {
        buttonFlyPosition.current = { center, zoom, bounds } // save last focused result

        if (bounds) {
          fitBounds(map, bounds)
        } else {
          map.flyTo({ center, zoom, ...mapFlyCurve })
        }

        await new Promise<void>((resolve) => {
          map.once('moveend', () => {
            resolve()
          })
        })

        // Store the location with bounds
        const locationWithBounds = {
          ...location,
          bounds
        }

        selectLocations([locationWithBounds])
        router.replace(updateQueryParam(query))
      } else {
        // no map available (e.g. home hero), use default area zoom level.
        // `layers` enables the overlay rendering this location type, so the
        // destination map draws the selected polygon, not just the filter
        const overlay = overlayForLocation(
          mapConfig.overlays.layers,
          location.type
        )
        router.push(
          getMapUrl({
            zoom,
            center,
            query,
            location,
            layers: overlay ? [overlay.id] : undefined,
            filters: type ? { type } : undefined
          })
        )
      }
      setLocationLoading(false)
    },
    [map, router, getLocationBounds, type, clearPoint]
  )

  const handleAddLocationClick = useCallback(
    async (location: ApiLocation) => {
      if (!map || !locations || locations.length === 0) return

      const query = getLocationLabel(location)
      const { type, address } = location

      setOpen(false)
      setSearchString(query)
      setLocationLoading(true)
      inputRef.current?.blur()
      clearEditMode() // Exit draw mode when adding a location
      clearPoint() // an address marker and a selected location are mutually exclusive

      // Get bounds for the new location
      const { bounds } = await getLocationBounds(location)

      // Store the location with bounds
      const locationWithBounds = { ...location, bounds }

      // Filter out smaller locations that are within the new location being added
      let filtered = locations

      if (type === 'area') {
        filtered = locations.filter(
          (l) => l.type === 'area' || l.address?.area !== address?.area
        )
      } else if (type === 'city') {
        filtered = locations.filter(
          (l) => l.type !== 'neighborhood' || l.address?.city !== address?.city
        )
      }

      const combinedLocations = [...filtered, locationWithBounds]

      if (map) {
        const combinedBounds = getLocationsBounds(combinedLocations)
        if (combinedBounds) fitBounds(map, combinedBounds)

        await new Promise<void>((resolve) => {
          map.once('moveend', () => {
            resolve()
          })
        })

        // Update map locations with all locations
        selectLocations(combinedLocations)

        router.replace(updateQueryParam(query))
      }

      setLocationLoading(false)
    },
    [map, router, locations, getLocationBounds, clearPoint]
  )

  const handleRemoveLocationClick = useCallback(
    async (location: ApiLocation) => {
      if (!map || !locations || locations.length === 0) return

      setLocationLoading(true)
      inputRef.current?.blur()

      // Remove location from array
      const remaining = locations.filter(
        (l) => l.locationId !== location.locationId
      )

      // If no locations left, clear everything
      if (!remaining.length) {
        clearSelection()
        setLocationLoading(false)
        return
      }

      // Calculate combined bounds from remaining locations

      if (map) {
        const combinedBounds = getLocationsBounds(remaining)
        if (combinedBounds) fitBounds(map, combinedBounds)

        await new Promise<void>((resolve) => {
          map.once('moveend', () => {
            resolve()
          })
        })

        // Update map locations
        selectLocations(remaining)
      }
      setLocationLoading(false)
    },
    [map, locations]
  )

  const handleAddressClick = useCallback(
    async (address: MapboxAddress) => {
      const query = getAddressLabel(address)

      setOpen(false)
      setSearchString(query)
      setLocationLoading(true)

      const point = await MapSearch.fetchMapboxAddressPoint(address)

      if (!point) {
        setLocationLoading(false)
        return
      }

      const zoom = mapConfig.zoom.address
      const center = toMapboxPoint(point)

      if (map) {
        clearLocations()
        setPoint({ center: [point.latitude, point.longitude], label: query })
        buttonFlyPosition.current = { center, zoom, bounds: null } // save last focused result
        map.flyTo({ center, zoom, ...mapFlyCurve })

        await new Promise<void>((resolve) => {
          map.once('moveend', () => {
            resolve()
          })
        })

        // An address/street is point-based, not a location: drop any active
        // location filter so listings come from the new map bounds, not the
        // previously selected location.
        clearLocationFilters()
        router.replace(updateQueryParam(query))
      } else {
        // Off the map (home hero, header): carry the marker into the map URL as
        // `point=` so the destination renders it like setPoint does on-map.
        router.push(
          getMapUrl({
            center,
            zoom,
            query,
            point: { center: [point.latitude, point.longitude] },
            ...(type && { filters: { type } })
          })
        )
      }

      setLocationLoading(false)
    },
    [map, router, type, setPoint, clearLocations, clearLocationFilters]
  )

  const handleListingClick = useCallback(
    (listing: ApiListing) => {
      // TODO: show ListingDrawer instead of redirecting
      router.push(getSeoUrl(listing))
    },
    [router]
  )

  return {
    handleLocationClick,
    handleAddLocationClick,
    handleRemoveLocationClick,
    handleAddressClick,
    handleListingClick,
    locationLoading
  }
}

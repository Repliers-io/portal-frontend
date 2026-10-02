/**
 * Owns location page data — area/city/hood metadata, the child-locations tree,
 * listings count and nearby locations — plus the location-map camera state
 * (center/zoom/boundary) driven by link focus/blur/click.
 * Consumed via useLocationPage / useLocationMap.
 * Anatomy: docs → product-guide/locations/technical
 */
'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react'
import { type Position } from 'geojson'
import { type LngLatLike } from 'mapbox-gl'

import locationConfig from '@configs/location'

import {
  resolveZoom,
  simplifyBoundary,
  toMapState
} from 'components/pages/locations/components/LocationHeader/utils'

import { type ApiListing, type ApiLocation } from 'services/API'
import { type LocationWithDistance } from 'services/LocationsTree'
import { capitalize, formatAreaLabel } from 'utils/strings'

type LocationContextValue = {
  area?: string
  /** Display name of the area — see `formatAreaLabel`. */
  areaLabel?: string
  city?: string
  hood?: string
  /**
   * The place this page is about — the narrowest level its URL named, widening
   * to the state at the catalog root. Every heading and label speaks through it,
   * so an area page says "York Region" rather than falling back to the state.
   */
  locationName: string
  count: number
  listings: ApiListing[]
  cityHasBuildings?: boolean
  location?: ApiLocation
  areas: ApiLocation[]
  cities: ApiLocation[]
  hoods: ApiLocation[]
  nearbies: LocationWithDistance[]
}

type LocationMapContextValue = {
  center?: LngLatLike
  zoom?: number
  // The drawn/framed boundary — the page's own location, or a hovered child's
  // (hover replaces the parent polygon; blur restores it).
  boundary?: Position[][][]
  onLinkFocus: (item: ApiLocation) => void
  onLinkBlur: () => void
  onLinkClick: () => void
}

const linkFocusDelay = 200

const LocationContext = createContext<LocationContextValue | null>(null)
const LocationMapContext = createContext<LocationMapContextValue | null>(null)

type LocationProviderProps = {
  area?: string
  city?: string
  hood?: string
  count: number
  listings?: ApiListing[]
  cityHasBuildings?: boolean
  location?: ApiLocation
  areas: ApiLocation[]
  cities: ApiLocation[]
  hoods: ApiLocation[]
  nearbies?: LocationWithDistance[]
  resetOnLeave?: boolean
  children: React.ReactNode
}

export const LocationProvider = ({
  area,
  city,
  hood,
  count,
  listings = [],
  cityHasBuildings,
  location,
  areas,
  cities,
  hoods,
  nearbies = [],
  resetOnLeave = true,
  children
}: LocationProviderProps) => {
  const home = useMemo(() => toMapState(location), [location])

  const [center, setCenter] = useState<LngLatLike | undefined>(home.center)
  const [zoom, setZoom] = useState<number | undefined>(home.zoom)
  const [boundary, setBoundary] = useState<Position[][][] | undefined>(
    home.boundary
  )
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigating = useRef(false)

  const onLinkClick = useCallback(() => {
    navigating.current = true
    if (focusTimer.current) clearTimeout(focusTimer.current)
  }, [])

  const onLinkFocus = useCallback((item: ApiLocation) => {
    if (navigating.current) return
    if (focusTimer.current) clearTimeout(focusTimer.current)
    focusTimer.current = setTimeout(() => {
      const withBoundary = !!item.map?.boundary?.length
      const withCoords = !!(item.map?.latitude && item.map?.longitude)

      if (withBoundary) {
        setBoundary(simplifyBoundary(item.map!.boundary!))
        setCenter(undefined)
        setZoom(undefined)
      } else if (withCoords) {
        setBoundary(undefined)
        setCenter([item.map!.longitude, item.map!.latitude])
        setZoom(resolveZoom(item))
      } else {
        setBoundary(undefined)
        setCenter(undefined)
        setZoom(undefined)
      }
    }, linkFocusDelay)
  }, [])

  const onLinkBlur = useCallback(() => {
    if (focusTimer.current) clearTimeout(focusTimer.current)
    if (navigating.current) return
    if (!resetOnLeave) return
    focusTimer.current = setTimeout(() => {
      setBoundary(home.boundary)
      setCenter(home.center)
      setZoom(home.zoom)
    }, linkFocusDelay)
  }, [resetOnLeave, home])

  const areaLabel = area ? formatAreaLabel(area) : undefined
  const narrowest = [city, hood].filter(Boolean).at(-1)
  const locationName = narrowest
    ? capitalize(narrowest)
    : (areaLabel ?? locationConfig.state)

  return (
    <LocationContext.Provider
      value={{
        area,
        areaLabel,
        city,
        hood,
        locationName,
        count,
        listings,
        cityHasBuildings,
        location,
        areas,
        cities,
        hoods,
        nearbies
      }}
    >
      <LocationMapContext.Provider
        value={{ center, zoom, boundary, onLinkFocus, onLinkBlur, onLinkClick }}
      >
        {children}
      </LocationMapContext.Provider>
    </LocationContext.Provider>
  )
}

export const useLocationPage = (): LocationContextValue => {
  const ctx = useContext(LocationContext)
  if (!ctx)
    throw new Error('useLocationPage must be used within LocationProvider')
  return ctx
}

export const useLocationMap = (): LocationMapContextValue => {
  const ctx = useContext(LocationMapContext)
  if (!ctx)
    throw new Error('useLocationMap must be used within LocationProvider')
  return ctx
}

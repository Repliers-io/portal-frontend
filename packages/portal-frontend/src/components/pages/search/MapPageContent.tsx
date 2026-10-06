/**
 * Root of the /search map + listings experience. Mounted inside
 * MapOptionsProvider → SearchProvider → AiSearchProvider (see app/search/[layout]/page.tsx).
 * Owns the fetch effect (camera + filters → SearchService.search → save) and the URL sync;
 * renders the filter bar (MapFilters) and the map/list orchestrator (MapRoot).
 * Anatomy: docs → product-guide/search/technical.
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Position } from 'geojson'
import { type LngLat, type LngLatBounds } from 'mapbox-gl'
import { useTranslations } from 'next-intl'

import {
  type Filters,
  getClusterParams,
  getListingFields,
  getPageParams,
  getSearchArea,
  type MapPoint,
  unresolvedExternalIds
} from 'services/Search'
import {
  type MapPosition,
  useMapLayers,
  useMapLocations,
  useMapOptions
} from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import {
  defaultOrientation,
  getMapUrl,
  getOrientation,
  type MapOrientation
} from 'utils/map'
import { capitalize } from 'utils/strings'
import { updateWindowHistory } from 'utils/urls'

import { MapFilters, MapRoot } from './components'

export const MapPageContent = () => {
  const searchParams = useSearchParams()
  const [mapLoaded, setMapLoaded] = useState(false)
  const { search, save, filters, polygon, region, point } = useSearch()
  const {
    layout,
    position,
    setPosition,
    setTitle,
    mode3D,
    mapRef,
    style,
    defaultStyle
  } = useMapOptions()
  const { locations } = useMapLocations()
  const { activeLayers } = useMapLayers()

  // Camera orientation mirrored from the map on every settled move; feeds the
  // 3D URL param and the initial map construction
  const [orientation, setOrientation] = useState<MapOrientation>(
    () => getOrientation(searchParams) ?? defaultOrientation()
  )

  const syncOrientation = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const bearing = Math.round(map.getBearing())
    const pitch = Math.round(map.getPitch())
    setOrientation((prev) =>
      prev.bearing === bearing && prev.pitch === pitch
        ? prev
        : { bearing, pitch }
    )
  }, [])
  const t = useTranslations()

  // The map page is a fixed, non-scrolling app shell: MapRoot fills the viewport
  // (position: fixed) while only the header and filter bar sit in normal flow.
  // macOS trackpads still fire elastic overscroll, bouncing the header/filter bar
  // against the pinned map. Suppress the rubber-band while this page is mounted and
  // restore the document default on unmount so other pages keep native overscroll.
  useEffect(() => {
    const html = document.documentElement
    const previous = html.style.overscrollBehavior
    html.style.overscrollBehavior = 'none'
    return () => {
      html.style.overscrollBehavior = previous
    }
  }, [])

  const query = searchParams.get('q')
  const page = searchParams.get('page')

  const fetchListings = async (
    position: MapPosition,
    searchFilters: Filters,
    drawPolygon: Position[] | null,
    point: MapPoint | null
  ) => {
    const { zoom, bounds } = position

    // Shared region resolver — same one the advanced-filters count uses, so the
    // boundary clip and location-polygon handling stay in lockstep (MOV-191).
    // A drawn polygon and a loaded saved-search region never coexist (drawing
    // replaces the loaded region), so the fallback order is safe.
    const { filters, area } = getSearchArea(searchFilters, {
      polygon: drawPolygon ?? region,
      point,
      bounds,
      locations
    })

    const response = await search({
      ...filters,
      ...getPageParams(),
      ...getListingFields(),
      ...getClusterParams(zoom),
      ...area
    })
    if (!response) return
    // Commit results to SearchProvider; useListingMarkers renders them reactively.
    save(response)
  }

  const handleMapLoad = useCallback(
    (bounds: LngLatBounds, center: LngLat, zoom: number) => {
      setMapLoaded(true)
      setPosition({ bounds, center, zoom })
      syncOrientation()
    },
    [setPosition, syncOrientation]
  )

  const handleMapMove = useCallback(
    (bounds: LngLatBounds, center: LngLat, zoom: number) => {
      setPosition({ bounds, center, zoom })
      syncOrientation()
    },
    [setPosition, syncOrientation]
  )

  const { center, zoom } = position

  useEffect(() => {
    if (filters.source === 'featured' && filters.slug) {
      setTitle(t('Map.featuredListings', { slug: capitalize(filters.slug) }))
    }
  }, [filters.source, filters.slug])

  useEffect(() => {
    if (!mapLoaded) return
    if (!center || !zoom) return
    // Selected external locations (schools…) constrain by geometry the client
    // resolves asynchronously — fetching before it lands would silently drop
    // the constraint. The resolve patches `locations`, re-firing this effect.
    if (unresolvedExternalIds(filters, locations).length) return
    fetchListings(position, filters, polygon, point)
    // `mapLoaded` MUST stay in the deps: `position` is value-deduped in
    // MapOptionsProvider, so when `moveend` sets the final position before
    // `load` fires, the mapLoaded false→true transition is the only thing that
    // re-runs this effect and dispatches the first fetch.
  }, [mapLoaded, position, filters, polygon, region, point, locations])

  const prevParams = useRef(JSON.stringify({ center, zoom, filters, point }))
  const curParams = JSON.stringify({ center, zoom, filters, point })
  const shouldReplaceUrl = curParams !== prevParams.current

  const pushUrl = (page: number | string | null) => {
    if (!center || !zoom) return
    updateWindowHistory(
      getMapUrl({
        center,
        zoom,
        layout,
        filters,
        query,
        point,
        page,
        layers: Array.from(activeLayers),
        mode3D: mode3D ? orientation : null,
        style: style === defaultStyle ? null : style
      })
    )
  }

  // WARN: every `center`|`zoom`|`filters` change should reset the page to 1
  useEffect(() => {
    if (!shouldReplaceUrl) return
    prevParams.current = curParams
    pushUrl(1)
  }, [shouldReplaceUrl])

  // WARN: layout (grid|map), overlay layer, 3D mode/orientation and map style
  // changes should KEEP the same page number
  // WARN: these changes should NOT use the router, but update window history directly
  useEffect(() => {
    pushUrl(page)
  }, [layout, activeLayers, mode3D, orientation, style])

  return (
    <>
      <MapFilters />
      <MapRoot
        zoom={zoom}
        center={center}
        polygon={polygon}
        region={region}
        orientation={orientation}
        onMove={handleMapMove}
        onLoad={handleMapLoad}
      />
    </>
  )
}

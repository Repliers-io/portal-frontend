import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl, {
  type LngLat,
  type LngLatBounds,
  Marker as MapboxMarker
} from 'mapbox-gl'

import { markerColors } from '@configs/colors'
import {
  type MapMoveCallback,
  useMapInit,
  useMapStyleSync
} from '@shared/Map/hooks'
import {
  listingDescriptors,
  mixedDescriptors
} from '@shared/Map/hooks/useListingMarkers/features'
import { createMarkerElement, type MarkerSize } from '@shared/Map/markerElement'

import { type ApiQueryParams } from 'services/API'
import { MAP_CONSTANTS } from 'services/Map'
import { type Filters } from 'services/Search'
import { useMapPopupActions } from 'providers/MapOptionsProvider'
import { getSeoUrl } from 'utils/listings'
import { executeOnStyleLoad, getMapUrl, toMapboxBounds } from 'utils/map'

import { useBoundsFetch } from './useBoundsFetch'
import { useMapListings } from './useMapListings'

interface UseMapboxInstanceOptions {
  containerRef: RefObject<HTMLDivElement | null>
  filters?: Partial<ApiQueryParams & Filters>
  fitToListings: boolean
  center?: [number, number]
  zoom: number
  markerSize: MarkerSize
  /** Enable scroll-to-zoom. Defaults to false (safe for page-embedded maps). */
  scrollZoom?: boolean
}

export const useMapboxInstance = ({
  containerRef,
  filters,
  fitToListings,
  center,
  zoom,
  markerSize,
  scrollZoom = false
}: UseMapboxInstanceOptions) => {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  // One marker per descriptor key (cluster or listing) so we diff instead of
  // recreating all — same manager shape as the main search map.
  const markersRef = useRef<Map<string, MapboxMarker>>(new Map())

  const { setListingPopup } = useMapPopupActions()

  // ── Step 1: dry fetch to discover bounding box (fitToListings mode only) ──
  // Runs at coarse zoom — no markers shown. Once ready the map can init and
  // fit to the returned bounds. Then onLoad fires with the real zoom.
  const { bounds: fitBounds, ready: boundsReady } = useBoundsFetch(
    filters,
    fitToListings
  )

  // Viewport state — set by onLoad AND onMove. useMapListings waits for this.
  // Both modes skip the listings fetch until the map reports its real viewport.
  const [viewport, setViewport] = useState<{
    bounds: LngLatBounds
    zoom: number
  } | null>(null)

  const onViewportChange = useCallback<MapMoveCallback>(
    (bounds: LngLatBounds, _center: LngLat, newZoom: number) => {
      setViewport({ bounds, zoom: newZoom })
    },
    []
  )

  // Map inits when:
  // - fitToListings=false: immediately
  // - fitToListings=true: after bounds fetch completes
  const enabled = !fitToListings || boundsReady

  // ── Step 2: listings fetch — only after onLoad delivers real zoom+bounds ──
  const skipListings = !enabled || viewport === null
  const { listings, clusters, count, loading, fetching } = useMapListings(
    filters,
    viewport?.zoom ?? zoom,
    viewport?.bounds,
    skipListings
  )

  const lngLatCenter = center ? new mapboxgl.LngLat(center[0], center[1]) : null

  useMapStyleSync()

  useMapInit({
    containerRef,
    center: lngLatCenter,
    zoom,
    enabled,
    scrollZoom,
    initialBounds: fitBounds ?? undefined,
    fitBoundsOptions: fitBounds ? { padding: 40, maxZoom: 16 } : undefined,
    onLoad: onViewportChange,
    onMove: onViewportChange,
    onInit: (map) => {
      mapRef.current = map
    },
    onCleanup: () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()
      mapRef.current = null
    }
  })

  // ── Render markers — identical clustering to the main search map ──────────
  // Above the count threshold the server aggregates into clusters, so we render
  // `mixedDescriptors`: circles for clusters above the inline threshold + individual
  // markers for the small clusters' inlined listings. Below it, render the listings
  // directly. Reusing the search map's descriptor builders keeps behaviour — and the
  // radius break-apart on zoom — the same, and never draws top-level listings on top
  // of the clusters that already contain them.
  useEffect(() => {
    const map = mapRef.current
    if (!map || loading) return

    const clusterMode = count > MAP_CONSTANTS.API_COUNT_TO_ENABLE_CLUSTERING
    const descriptors = clusterMode
      ? mixedDescriptors(clusters, markerSize, markerColors.default)
      : listingDescriptors(listings, markerSize)

    const renderMarkers = () => {
      const current = markersRef.current
      const nextKeys = new Set(descriptors.map((d) => d.key))

      // remove markers whose descriptor is gone (re-cluster, pan, refetch)
      current.forEach((marker, key) => {
        if (!nextKeys.has(key)) {
          marker.remove()
          current.delete(key)
        }
      })

      // add only the descriptors that aren't already on the map
      descriptors.forEach((d) => {
        if (current.has(d.key)) return

        const element = createMarkerElement({
          kind: d.kind,
          label: d.label,
          color: d.color,
          hoverColor: d.hoverColor,
          link:
            d.kind === 'cluster'
              ? getMapUrl({ center: [d.lng, d.lat], zoom: map.getZoom() })
              : getSeoUrl(d.listing!)
        })

        if (d.kind === 'cluster') {
          const bounds = d.bounds!
          const { top_left, bottom_right } = bounds
          const buffer =
            (bottom_right.longitude - top_left.longitude) *
            MAP_CONSTANTS.ZOOM_TO_MARKER_BUFFER
          element.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            map.fitBounds(toMapboxBounds(bounds, buffer))
          })
        } else {
          const listing = d.listing!
          element.addEventListener('mouseenter', () =>
            setListingPopup({ listing, lng: d.lng, lat: d.lat })
          )
          element.addEventListener('mouseleave', () => setListingPopup(null))
        }

        current.set(
          d.key,
          new MapboxMarker(element).setLngLat([d.lng, d.lat]).addTo(map)
        )
      })
    }

    const cleanup = executeOnStyleLoad(map, renderMarkers)
    return () => cleanup()
  }, [listings, clusters, count, loading, markerSize])

  return { mapRef, loading, fetching }
}

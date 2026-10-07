'use client'

import { useEffect, useRef, useState } from 'react'
import { Marker } from 'mapbox-gl'

import gridConfig from '@configs/cards-grids'
import { markerColors } from '@configs/colors'
import mapConfig from '@configs/map'
import { type MarkerSize } from '@shared/Map'
import { useMapListener } from '@shared/Map/hooks/useMapListener'
import { useParcelGroups } from '@shared/Map/hooks/useParcelListings'
import { createMarkerElement, setMarkerHover } from '@shared/Map/markerElement'

import { type ApiListing } from 'services/API'
import { MAP_CONSTANTS } from 'services/Map/constants'
import { useMapOptions, useMapPopupActions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import {
  cardsActive,
  getMarkerName,
  getMarkerSize,
  markersActive
} from 'utils/listings'
import {
  easeInOutCubic,
  parcelMatchedSourceId,
  setHoverState,
  toMapboxBounds
} from 'utils/map'

import {
  listingDescriptors,
  type MarkerDescriptor,
  mixedDescriptors
} from './features'

// The fields the desktop click handler needs — satisfied by both the DOM
// MouseEvent (from the marker) and React's synthetic event (from grid cards).
export type MarkerClickEvent = Pick<
  MouseEvent,
  'button' | 'ctrlKey' | 'metaKey'
>

type UseListingMarkersOptions = {
  /** Touch device (mobile/tablet) — taps centre the map and open the drawer. */
  touch: boolean
  /** Desktop click on a marker (wide → browser dialog, narrow → navigate). */
  onListingClick: (
    event: MarkerClickEvent,
    listing: ApiListing,
    multiUnit: boolean
  ) => void
  /** Fired after the touch fly-to settles, to open the listing drawer. */
  onListingTap: (listing: ApiListing, multiUnit: boolean) => void
}

export const useListingMarkers = ({
  touch,
  onListingClick,
  onListingTap
}: UseListingMarkersOptions): void => {
  const { mapRef } = useMapOptions()
  const { setListingPopup } = useMapPopupActions()
  const { clusters, count, filters, listings } = useSearch()
  // The parcel under each listing, lit together with the marker. Read inside the
  // marker handlers, which are wired once per element.
  const { parcelOf } = useParcelGroups()
  const parcelOfRef = useRef(parcelOf)
  parcelOfRef.current = parcelOf

  // Server already aggregates clusters once the result set is large enough.
  const clusterMode = count > MAP_CONSTANTS.API_COUNT_TO_ENABLE_CLUSTERING

  const touchRef = useRef(touch)
  touchRef.current = touch
  const clickRef = useRef(onListingClick)
  clickRef.current = onListingClick
  const tapRef = useRef(onListingTap)
  tapRef.current = onListingTap

  const markersRef = useRef<Map<string, Marker>>(new Map())

  // The marker the pointer is currently over (its key, grid cards and parcel). Lets
  // the diff dismiss the hover popup when that marker is removed without a mouseleave.
  const hoverRef = useRef<{
    key: string
    cards: string[]
    parcel?: string
  } | null>(null)

  // Dot below the point/tag threshold, price pill at/above it.
  const [markerSize, setMarkerSize] = useState<MarkerSize>('tag')

  // Track the size bucket from the live zoom.
  useMapListener(mapRef, (map) => {
    setMarkerSize(getMarkerSize(map.getZoom()))
    map.on('zoomend', () => setMarkerSize(getMarkerSize(map.getZoom())))
  })

  // Build descriptors and diff them against the live markers — only the ones
  // that actually changed are created/removed (no flicker, cheap on pan).
  useEffect(() => {
    const map = mapRef?.current
    if (!map) return

    const wire = (el: HTMLElement, d: MarkerDescriptor): void => {
      if (d.kind === 'cluster') {
        el.addEventListener('click', () => {
          const bounds = d.bounds!
          const { top_left, bottom_right } = bounds
          const buffer =
            (bottom_right.longitude - top_left.longitude) *
            MAP_CONSTANTS.ZOOM_TO_MARKER_BUFFER
          map.fitBounds(toMapboxBounds(bounds, buffer))
        })
        return
      }

      const listing = d.listing!
      const mlsNumber = d.mlsNumber!
      // Multi-unit markers stand in for several same-address listings — light
      // up all their grid cards, falling back to the single representative.
      const cards = d.mlsNumbers ?? [mlsNumber]

      const enter = () => {
        const parcel = parcelOfRef.current.get(mlsNumber)
        hoverRef.current = { key: d.key, cards, parcel }
        setListingPopup({ listing, lng: d.lng, lat: d.lat })
        markersActive([mlsNumber], true)
        cardsActive(cards, true)
        if (parcel) setHoverState(map, parcelMatchedSourceId, parcel, true)
      }
      const leave = () => {
        const parcel = parcelOfRef.current.get(mlsNumber)
        hoverRef.current = null
        setListingPopup(null)
        markersActive([mlsNumber], false)
        cardsActive(cards, false)
        if (parcel) setHoverState(map, parcelMatchedSourceId, parcel, false)
      }
      // The parcel under the marker calls enter/leave too, see useParcelListings.
      const hover = { enter, leave, onParcel: false }
      setMarkerHover(el, hover)

      // Hover popup + card highlight are pointer-only affordances. On a touch
      // device a tap synthesizes mouseenter, which would pop the hover card on
      // top of the drawer that same tap opens — so skip them when touch.
      el.addEventListener('mouseenter', () => {
        if (touchRef.current || hover.onParcel) return
        enter()
      })
      el.addEventListener('mouseleave', () => {
        if (touchRef.current || hover.onParcel) return
        leave()
      })
      el.addEventListener('click', (e) => {
        if (!touchRef.current) {
          clickRef.current(e, listing, Boolean(d.multiUnit))
          return
        }
        // Touch: highlight, fly the marker above the drawer, then open it.
        e.preventDefault()
        e.stopPropagation()
        document
          .querySelectorAll('.lm.active')
          .forEach((el) => el.classList.remove('active'))
        document
          .getElementById(getMarkerName(mlsNumber))
          ?.classList.add('active')
        const pixels = map.project([d.lng, d.lat])
        pixels.y += Number(gridConfig.listingCardSizes.drawer.height) / 2
        map.flyTo({
          center: map.unproject(pixels),
          ...mapConfig.mapFlyCurve,
          easing: easeInOutCubic
        })
        map.once('moveend', () => tapRef.current(listing, Boolean(d.multiUnit)))
      })
    }

    // Cluster mode renders the union: circles for clusters above the threshold
    // plus individual markers for the inlined small-cluster listings.
    const palette = markerColors as Record<
      string,
      { color: string; hoverColor?: string } | undefined
    >
    const clusterColor =
      filters.status === 'U'
        ? (palette.sold ?? markerColors.default)
        : markerColors.default
    const descriptors = clusterMode
      ? mixedDescriptors(clusters, markerSize, clusterColor)
      : listingDescriptors(listings, markerSize)

    const current = markersRef.current
    const nextKeys = new Set(descriptors.map((d) => d.key))

    current.forEach((marker, key) => {
      if (!nextKeys.has(key)) {
        // A marker removed from under the pointer never fires mouseleave (the
        // browser skips it once the node leaves the DOM), so its hover popup +
        // card highlight would float on forever. Dismiss them here — covers
        // zoom re-clustering, point/tag size rebuilds, and refetches.
        if (hoverRef.current?.key === key) {
          const { cards, parcel } = hoverRef.current
          setListingPopup(null)
          cardsActive(cards, false)
          if (parcel) setHoverState(map, parcelMatchedSourceId, parcel, false)
          hoverRef.current = null
        }
        marker.remove()
        current.delete(key)
      }
    })

    descriptors.forEach((d) => {
      if (current.has(d.key)) return
      const el = createMarkerElement({
        kind: d.kind,
        label: d.label,
        color: d.color,
        hoverColor: d.hoverColor,
        id: d.mlsNumber ? getMarkerName(d.mlsNumber) : undefined,
        // members lets a grid card resolve to this marker even when it's a
        // multi-unit standing in for several same-address listings
        members: d.mlsNumbers ?? (d.mlsNumber ? [d.mlsNumber] : undefined)
      })
      wire(el, d)
      current.set(
        d.key,
        new Marker({ element: el }).setLngLat([d.lng, d.lat]).addTo(map)
      )
    })
  }, [
    clusterMode,
    clusters,
    filters,
    listings,
    markerSize,
    mapRef,
    setListingPopup
  ])

  // Remove every marker when the map instance goes away.
  useEffect(() => {
    const current = markersRef.current
    return () => {
      current.forEach((marker) => marker.remove())
      current.clear()
    }
  }, [mapRef])
}

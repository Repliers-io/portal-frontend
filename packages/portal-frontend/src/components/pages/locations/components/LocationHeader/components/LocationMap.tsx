'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Map as MapboxMap, Marker } from 'mapbox-gl'

import { Box } from '@mui/material'

import { markerColors } from '@configs/colors'
import mapConfig from '@configs/map'
import { ListingPopupHost, MapContainer } from '@shared/Map'
import {
  createMarkerElement,
  markerKind,
  type MarkerSize
} from '@shared/Map/markerElement'

import buildingPopupExtensionInstance from 'services/Map/BuildingPopupExtension'
import { useLocationMap, useLocationPage } from 'providers/LocationProvider'
import { useMapOptions, useMapPopupActions } from 'providers/MapOptionsProvider'
import { formatPrice } from 'utils/formatters'
import {
  displayOnMap,
  getMarkerSize,
  getSeoUrl,
  type ListingMarkerColor,
  resolveListingMarkerColor
} from 'utils/listings'
import {
  addBoundaryPolygon,
  executeOnStyleLoad,
  fitBounds,
  getBoundaryBounds,
  getDefaultBounds,
  getMapStyleUrl,
  removePolygon,
  styleReady,
  webglSupported
} from 'utils/map'

import { LocationMapControls } from './LocationMapControls'

const { mapboxDefaults, mapFlyCurve, animateLocationTransition } = mapConfig

// 2× the Mapbox default (1.2) — snappy location transitions. Applies to both
// flyTo and fitBounds (fitBounds flies internally, so it honours speed too).
const flySpeed = 2.4

type MapMarker = {
  latitude: number
  longitude: number
  link: string
  name?: string
  address?: string
  imageUrl?: string
}

export const LocationMap = ({ markers }: { markers?: MapMarker[] }) => {
  const { center, zoom, boundary } = useLocationMap()
  const { listings } = useLocationPage()
  const { style, position, setMapRef } = useMapOptions()
  const { setListingPopup } = useMapPopupActions()
  const mapRef = useRef<MapboxMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Marker[]>([])
  const listingMarkersRef = useRef<Marker[]>([])
  const styleApplied = useRef(false)
  // Latest boundary for the style.load listener (attached once at map init).
  const boundaryRef = useRef(boundary)
  boundaryRef.current = boundary
  const [listingMarkerSize, setListingMarkerSize] =
    useState<MarkerSize>('point')

  // Camera only — the boundary polygon is drawn by its own effect below, so it
  // persists independently of camera moves.
  const applyPosition = (map: MapboxMap) => {
    map.stop()
    const animate = animateLocationTransition
    if (boundary) {
      fitBounds(map, getBoundaryBounds(boundary), { animate, speed: flySpeed })
    } else if (center) {
      map.flyTo({
        center,
        zoom: zoom ?? position.zoom,
        ...mapFlyCurve,
        speed: flySpeed,
        animate
      })
    } else {
      map.fitBounds(position.bounds || getDefaultBounds(), {
        ...mapFlyCurve,
        speed: flySpeed,
        animate
      })
    }
  }

  const initializeMap = (container: HTMLElement) => {
    const base = {
      container,
      ...mapboxDefaults,
      scrollZoom: false,
      touchZoomRotate: false,
      style: getMapStyleUrl(style)
    }

    if (boundary) {
      mapRef.current = new MapboxMap({
        ...base,
        bounds: getBoundaryBounds(boundary)
      })
    } else if (center) {
      mapRef.current = new MapboxMap({
        ...base,
        center,
        zoom: zoom ?? position.zoom
      })
    } else {
      mapRef.current = new MapboxMap({
        ...base,
        bounds: position.bounds || getDefaultBounds(),
        zoom: position.zoom
      })
    }
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady(map)) return
    applyPosition(map)
  }, [boundary, center, zoom])

  useEffect(() => {
    // No WebGL (e.g. hardware acceleration off) — the Map constructor would
    // throw and crash the page; MapContainer renders the message instead.
    if (!containerRef.current || !webglSupported()) return

    // Initialize map only once
    if (!mapRef.current) {
      initializeMap(containerRef.current)
    }

    const map = mapRef.current
    if (!map) return

    setMapRef(map)

    map.on('zoomend', () => {
      setListingMarkerSize(getMarkerSize(map.getZoom()))
    })

    // A style switch (map / hybrid / satellite) wipes all custom GL layers;
    // re-draw the boundary polygon once the new style loads. Same pattern as
    // use3DBuildings/useOverlayLayers.
    map.on('style.load', () => {
      const shown = boundaryRef.current
      if (shown) addBoundaryPolygon(map, shown)
    })

    executeOnStyleLoad(map, () => applyPosition(map))

    // Create a ResizeObserver to handle container resizing
    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(containerRef.current)

    // Cleanup on component unmount
    return () => {
      resizeObserver.disconnect()
      mapRef.current = null
      try {
        map.remove()
      } catch {
        // Map has been removed already
      }
    }
  }, [])

  useEffect(() => {
    // The map is constructed with the current style already; re-applying it on mount
    // diff-reloads the style and wipes custom sources/layers (e.g. the location
    // outline). Only call setStyle on an actual style switch.
    if (!styleApplied.current) {
      styleApplied.current = true
      return
    }
    mapRef.current?.setStyle(getMapStyleUrl(style))
  }, [style])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !markers?.length) return

    const addMarkers = () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      markers.forEach(
        ({ latitude, longitude, link, name, address, imageUrl }) => {
          const lat = latitude
          const lng = longitude
          if (!isFinite(lat) || !isFinite(lng)) return

          const defaultMarker: ListingMarkerColor = markerColors.default
          const element = createMarkerElement({
            link,
            kind: 'dot',
            label: '',
            color: defaultMarker.color,
            hoverColor: defaultMarker.hoverColor
          })
          const marker = new Marker({ element })
            .setLngLat([lng, lat])
            .addTo(map)
          if (name) {
            element.addEventListener('mouseenter', () =>
              buildingPopupExtensionInstance.showPopup(
                { name, address, imageUrl, href: link },
                marker,
                map
              )
            )
            element.addEventListener('mouseleave', () =>
              buildingPopupExtensionInstance.removePopup()
            )
          }
          markersRef.current.push(marker)
        }
      )
    }

    const cleanup = executeOnStyleLoad(map, addMarkers)

    return () => {
      cleanup()
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [markers])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !listings.length) return

    listingMarkersRef.current.forEach((m) => m.remove())
    listingMarkersRef.current = []

    listings.filter(displayOnMap).forEach((listing) => {
      const { map: coords, listPrice } = listing
      const link = getSeoUrl(listing)
      const label = formatPrice(listPrice)

      const { color, hoverColor } = resolveListingMarkerColor({ listing })
      const element = createMarkerElement({
        link,
        label,
        kind: markerKind(listingMarkerSize, listPrice),
        color,
        hoverColor
      })
      const marker = new Marker({ element })
        .setLngLat([coords.longitude, coords.latitude])
        .addTo(map)
      element.addEventListener('mouseenter', () =>
        setListingPopup({
          listing,
          lng: coords.longitude,
          lat: coords.latitude
        })
      )
      element.addEventListener('mouseleave', () => setListingPopup(null))
      listingMarkersRef.current.push(marker)
    })

    return () => {
      listingMarkersRef.current.forEach((m) => m.remove())
      listingMarkersRef.current = []
    }
  }, [listings, listingMarkerSize])

  // The filled boundary polygon — the page's location, or a hovered child's
  // (hover replaces the parent; blur restores it). Decoupled from camera moves.
  // `addPolygonToMap` waits for the initial style itself; survival across style
  // switches is the `style.load` listener at map init.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (boundary) addBoundaryPolygon(map, boundary)
    else removePolygon(map)
  }, [boundary])

  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'block' },
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: '#e9e6e0', // TODO: use theme color
        contentVisibility: 'visible',
        minWidth: { sm: 500, lg: 600 },
        height: 412
      }}
    >
      <MapContainer ref={containerRef} />
      <ListingPopupHost />
      <LocationMapControls />
    </Box>
  )
}

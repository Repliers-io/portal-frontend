import React, { type RefObject, useEffect, useState } from 'react'
import {
  type LngLat,
  type LngLatBounds,
  type Map as MapboxMap
} from 'mapbox-gl'
import { useTranslations } from 'next-intl'

import { IconButton, Tooltip } from '@mui/material'

import { GpsFixedIcon } from '@configs/icons'
import mapConfig from '@configs/map'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { fitBounds } from 'utils/map'

interface MapCenterButtonProps {
  mapRef: RefObject<MapboxMap | null>
  // Either bounds OR center+zoom (bounds takes priority)
  bounds?: LngLatBounds | null
  center?: LngLat | null
  zoom?: number
  /** Distance threshold in meters to show recenter button */
  recenterThreshold?: number
  /** Custom icon element to render instead of the default GpsFixedIcon */
  icon?: React.ReactNode
}

const { mapFlyCurve } = mapConfig

export const MapCenterButton = ({
  mapRef,
  bounds,
  center,
  zoom,
  recenterThreshold = 20,
  icon
}: MapCenterButtonProps) => {
  const t = useTranslations()
  const { centerEnabled } = useMapOptions()
  const [visible, setVisible] = useState(false)

  const map = mapRef.current

  // Check if map is centered on target whenever bounds/center/locations change
  useEffect(() => {
    if (!map || !centerEnabled) {
      setVisible(false)
      return
    }

    const targetCenter = bounds?.getCenter() || center
    if (!targetCenter) {
      setVisible(false)
      return
    }

    const currentCenter = map.getCenter()
    const distanceMeters = currentCenter.distanceTo(targetCenter)

    // Don't show immediately while the map is animating to the target —
    // the flight will end at the target, making the button pointless.
    // The moveend listener below picks up tracking once the map settles.
    setVisible(distanceMeters > recenterThreshold && !map.isMoving())
  }, [map, bounds, center, centerEnabled, recenterThreshold])

  // Subscribe to user movements (not programmatic)
  useEffect(() => {
    if (!map || !centerEnabled) return

    const handleMoveEnd = () => {
      const targetCenter = bounds?.getCenter() || center
      if (!targetCenter) return

      const currentCenter = map.getCenter()
      const distanceMeters = currentCenter.distanceTo(targetCenter)

      // Show button if user moved away from target
      setVisible(distanceMeters > recenterThreshold)
    }

    map.on('moveend', handleMoveEnd)

    return () => {
      map.off('moveend', handleMoveEnd)
    }
  }, [map, bounds, center, centerEnabled, recenterThreshold])

  // Hide button when centerEnabled becomes false
  useEffect(() => {
    if (!centerEnabled) setVisible(false)
  }, [centerEnabled])

  const handleRecenter = () => {
    if (!map) return

    if (bounds) {
      // Bounds mode
      fitBounds(map, bounds)
    } else if (center && zoom !== undefined) {
      // Center + zoom mode
      map.flyTo({
        center,
        zoom,
        ...mapFlyCurve
      })
    }

    // Hide button after recenter
    map.once('moveend', () => setVisible(false))
  }

  if (!mapRef.current) return null

  return (
    <Tooltip
      arrow
      enterDelay={200}
      placement="top-end"
      title={t('Map.recenter')}
    >
      <IconButton
        onClick={handleRecenter}
        sx={{
          width: 38,
          height: 38,
          transition: 'opacity 0.3s',
          ...(visible
            ? { opacity: 1, pointerEvents: 'auto' }
            : { opacity: 0, pointerEvents: 'none' })
        }}
      >
        {icon ?? <GpsFixedIcon sx={{ fontSize: 22, color: 'primary.main' }} />}
      </IconButton>
    </Tooltip>
  )
}

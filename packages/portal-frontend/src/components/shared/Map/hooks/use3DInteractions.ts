/* eslint-disable no-use-before-define */
import { useEffect, useRef } from 'react'
import type { MapMouseEvent } from 'mapbox-gl'

import mapConfig from '@configs/map'

import { useMapOptions } from 'providers/MapOptionsProvider'

const {
  enabled,
  pitch,
  pitchEnabled,
  pitchModifier,
  pitchSensitivity,
  rotationEnabled,
  rotationModifier: rotationModifierConfig,
  rotationSensitivity,
  rotationEnabledIn2D,
  combinedMode,
  wheelRotationEnabled,
  wheelRotationRequiresModifier,
  wheelRotationSensitivity,
  wheelRotationDebounce
} = mapConfig.map3D

/**
 * Hook for 3D mouse interactions with search service integration
 * Automatically reads map and mode3D from MapOptionsProvider
 * Returns rotating ref to track rotation state
 */
export const use3DInteractions = ({
  onRotateStart,
  onRotateEnd
}: {
  onRotateStart: () => void
  onRotateEnd: () => void
}) => {
  const { mapRef, mode3D } = useMapOptions()
  const map = mapRef?.current || null
  const rotatingRef = useRef(false)
  const onRotateStartRef = useRef(onRotateStart)
  const onRotateEndRef = useRef(onRotateEnd)
  onRotateStartRef.current = onRotateStart
  onRotateEndRef.current = onRotateEnd

  useEffect(() => {
    if (!map) return

    if (!enabled) return

    // Determine platform-specific rotation modifier
    const macPlatform =
      typeof navigator !== 'undefined' &&
      /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

    const rotationModifier = macPlatform
      ? rotationModifierConfig.mac
      : rotationModifierConfig.win

    let dragging = false
    let startPoint = { x: 0, y: 0 }
    let startPitch = 0
    let startBearing = 0
    let wheelRotating = false
    let wheelRotateTimeout: ReturnType<typeof setTimeout> | null = null

    // Helper to end rotation and restore map interaction
    const endRotation = () => {
      map.dragPan.enable()
      map.getContainer().classList.remove('disable-pointer-events')
      rotatingRef.current = false
      // Remove global mousemove listener
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      onRotateEndRef.current()
    }

    const handleMouseDown = (e: MapMouseEvent) => {
      const originalEvent = e.originalEvent as MouseEvent

      if (originalEvent[pitchModifier] || originalEvent[rotationModifier]) {
        dragging = true
        startPoint = { x: originalEvent.clientX, y: originalEvent.clientY }
        startPitch = map.getPitch()
        startBearing = map.getBearing()

        map.dragPan.disable()
        map.getContainer().classList.add('disable-pointer-events')
        rotatingRef.current = true
        onRotateStartRef.current()

        // Add global mousemove listener to track movement outside map container
        window.addEventListener('mousemove', handleGlobalMouseMove)

        e.preventDefault()
      }
    }

    const handleGlobalMouseMove = (originalEvent: MouseEvent) => {
      if (!dragging) return

      const deltaX = originalEvent.clientX - startPoint.x
      const deltaY = originalEvent.clientY - startPoint.y

      const hasPitchModifier = originalEvent[pitchModifier]
      const hasRotationModifier = originalEvent[rotationModifier]
      const hasCombinedModeModifier =
        combinedMode && (hasPitchModifier || hasRotationModifier)

      // Check if user released modifier during drag - if so, end rotation
      if (!hasPitchModifier && !hasRotationModifier) {
        dragging = false
        endRotation()
        return
      }

      const canPitch =
        pitchEnabled && mode3D && (hasPitchModifier || hasCombinedModeModifier)

      const canRotate =
        (rotationEnabledIn2D || (rotationEnabled && mode3D)) &&
        (hasRotationModifier || hasCombinedModeModifier)

      if (canPitch) {
        const pitchChange = deltaY * pitchSensitivity
        const clampedPitch = Math.min(pitch.max, startPitch - pitchChange)
        const newPitch = Math.max(0, clampedPitch)
        map.setPitch(newPitch)
      }

      if (canRotate) {
        const bearingChange = deltaX * rotationSensitivity
        const newBearing = startBearing + bearingChange
        map.setBearing(newBearing)
      }

      originalEvent.preventDefault()
    }

    const handleGlobalMouseUp = () => {
      if (dragging) {
        dragging = false
        endRotation()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scroll
      const rotationDelta = e.deltaX * wheelRotationSensitivity

      if (
        (rotationEnabledIn2D || (rotationEnabled && mode3D)) &&
        rotationDelta &&
        (!wheelRotationRequiresModifier || e[rotationModifier])
      ) {
        e.preventDefault()
        e.stopPropagation()

        // Start rotation event on first wheel
        if (!wheelRotating) {
          wheelRotating = true
          map.getContainer().classList.add('disable-pointer-events')
          rotatingRef.current = true
          onRotateStartRef.current()
        }

        const currentBearing = map.getBearing()
        const newBearing = currentBearing + rotationDelta
        map.setBearing(newBearing)

        // Clear existing timeout
        if (wheelRotateTimeout) clearTimeout(wheelRotateTimeout)

        // End rotation event after debounce time of no wheel events
        wheelRotateTimeout = setTimeout(() => {
          wheelRotating = false
          endRotation()
          wheelRotateTimeout = null
        }, wheelRotationDebounce)
      }
      // Let vertical scroll (deltaY) pass through for native zoom
    }

    // Add event listeners
    map.on('mousedown', handleMouseDown)
    // Listen for mouseup globally to catch releases outside map
    window.addEventListener('mouseup', handleGlobalMouseUp)

    const mapContainer = map.getContainer()
    // Add wheel listener only if wheel rotation is enabled
    if (wheelRotationEnabled)
      mapContainer.addEventListener('wheel', handleWheel, { passive: false })

    // Cleanup function
    return () => {
      if (wheelRotateTimeout) {
        clearTimeout(wheelRotateTimeout)
      }
      map.off('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      if (wheelRotationEnabled)
        mapContainer.removeEventListener('wheel', handleWheel)
    }
  }, [map, mode3D])

  return rotatingRef
}

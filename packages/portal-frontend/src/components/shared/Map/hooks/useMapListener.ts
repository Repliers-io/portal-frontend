import { type RefObject, useEffect, useRef, useState } from 'react'
import type { Map as MapboxMap } from 'mapbox-gl'

/**
 * Attach map event listeners exactly once, as soon as the map is ready.
 *
 * `mapRef.current` is assigned imperatively (no re-render), so the effect carries
 * no deps and re-checks every render until the map exists; a ref guard makes
 * `attach` fire a single time. Listeners are never detached — they live for the
 * map's lifetime, matching the inline effects this replaces.
 */
export const useMapListener = (
  mapRef: RefObject<MapboxMap | null>,
  attach: (map: MapboxMap) => void
) => {
  const attachedRef = useRef(false)
  useEffect(() => {
    const map = mapRef.current
    if (!map || attachedRef.current) return
    attachedRef.current = true
    attach(map)
  })
}

/** Flips true once the map exists — a render trigger for effects that need it. */
export const useMapReady = (mapRef: RefObject<MapboxMap | null>) => {
  const [ready, setReady] = useState(false)
  useMapListener(mapRef, () => setReady(true))
  return ready
}

import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { FeatureCollection } from 'geojson'
import { LngLat } from 'mapbox-gl'

import mapConfig from '@configs/map'
import type { OverlayLayerDefinition } from '@defaults/map'

import {
  useMapLayers,
  useMapLocations,
  useMapOptions,
  useMapPopup,
  useMapPopupActions
} from 'providers/MapOptionsProvider'
import { markerLinkId, overlayPolygonId } from 'utils/map/overlays'
import { polygonFeature } from 'utils/map/polygons'

import { useMapListener } from '../useMapListener'
import {
  createOverlayMarkersState,
  type OverlayMarkersState,
  recolorOverlayMarkers,
  removeOverlayMarkers,
  renderOverlayMarkers
} from '../useOverlayMarkers/renderMarkers'

import {
  addOverlayPolygons,
  mergeWithPrevPolygons,
  removeOverlayPolygons
} from './layers'
import { useOverlayPopupDismiss } from './useOverlayPopupDismiss'

const noFeatures: FeatureCollection = {
  type: 'FeatureCollection',
  features: []
}

export const useOverlayLayers = (
  overlays: OverlayLayerDefinition[] = mapConfig.overlays.layers
) => {
  const { mapRef, position, style } = useMapOptions()
  const { overlayPopup } = useMapPopup()
  const { setOverlayPopup, overlayPopupRef, closeOverlayMarkerRef } =
    useMapPopupActions()
  const { activeLayers, setLayerLoading, setLayerData, layerOptions } =
    useMapLayers()
  const { locations } = useMapLocations()
  // Latest selection ids, read at marker-render time (inside effects) so a fresh
  // marker for a selected location — e.g. a URL `locationId` on load — is born
  // selected, even when the idle re-stamp runs before the DOM marker exists.
  const selectedIdsRef = useRef<Set<string>>(new Set())
  selectedIdsRef.current = new Set((locations ?? []).map((l) => l.locationId))

  const abortRefs = useRef<Record<string, AbortController>>({})
  // Per-overlay DOM marker manager state (live markers + cached cluster index).
  const markersRefs = useRef<Record<string, OverlayMarkersState>>({})
  const prevDataRef = useRef<Record<string, FeatureCollection>>({})
  // Key of each layer's last successful sync inputs (viewport + options). Lets a
  // layer toggle skip re-fetching/re-rendering every other already-loaded layer.
  const syncKey = useRef<Record<string, string>>({})
  // Cleanup functions for polygon hover tooltip listeners, keyed by overlay id.
  const polygonHoverCleanupRefs = useRef<Record<string, () => void>>({})
  // Tracks which polygon overlay currently owns the shared popup. Prevents
  // onLeave from clearing a popup that was already taken by another overlay.
  const activePolygonOverlayRef = useRef<string | null>(null)
  // True while a DOM marker tooltip owns the popup. The polygon mousemove handler
  // must not override or clear it — the marker always takes priority.
  const markerActiveRef = useRef<boolean>(false)
  // Latest dark-palette flag + overlays, read by the (once-attached) style.load
  // listener so it recolours live markers with the current style/config.
  const darkRef = useRef(false)
  darkRef.current = style === 'satellite' || style === 'hybrid'
  const overlaysRef = useRef(overlays)
  overlaysRef.current = overlays

  // Stable — every member is a ref or a state setter — so `updateLayer` can list
  // it as a dependency without being rebuilt on each render.
  const popup = useMemo(
    () => ({
      overlayPopupRef,
      setOverlayPopup,
      markerActiveRef,
      closeMarkerRef: closeOverlayMarkerRef
    }),
    [overlayPopupRef, setOverlayPopup, closeOverlayMarkerRef]
  )

  const markersState = (id: string): OverlayMarkersState =>
    (markersRefs.current[id] ??= createOverlayMarkersState())

  const syncOverlays = () => {
    const map = mapRef?.current
    if (!map) return
    const dark = style === 'satellite' || style === 'hybrid'

    overlays.forEach((o) => {
      const { id, polygon, fetchData, activationMinZoom, renderMinZoom } = o
      const enabled = activeLayers.has(id)

      const cleanup = () => {
        if (abortRefs.current[id]) {
          abortRefs.current[id].abort()
          delete abortRefs.current[id]
          // The aborted request no longer owns the loading flag (see the
          // identity guard below), so release it here.
          setLayerLoading(id, false)
        }
        if (markersRefs.current[id]) {
          removeOverlayMarkers(markersRefs.current[id])
          delete markersRefs.current[id]
        }
        removeOverlayPolygons(map, o)
        delete syncKey.current[id]
        // `layerData` means "what this overlay currently has on the map", not "what it
        // once loaded". Leaving the last collection published keeps its consumers
        // acting on a layer that is no longer drawn — a listing rendered as a parcel
        // stays a parcel after the map drops below the render floor. The
        // `prevDataRef` guard also stops this from re-publishing on every sync of an
        // overlay that is simply switched off.
        if (o.publishData && prevDataRef.current[id])
          setLayerData(id, noFeatures)
        delete prevDataRef.current[id]
        polygonHoverCleanupRefs.current[id]?.()
        delete polygonHoverCleanupRefs.current[id]
      }

      if (!enabled) {
        cleanup()
        // Clear the tooltip if it belongs to this layer. Through the marker's own
        // closer when a tap opened it, so its polygon highlight and ring go too.
        if (overlayPopup?.overlayId === id) {
          if (closeOverlayMarkerRef.current) closeOverlayMarkerRef.current()
          else setOverlayPopup(null)
        }
        return
      }

      const bounds = position.bounds
      if (!bounds) return

      // Remove below the render floor; re-fetched once zoomed back in. Falls back to
      // the activation zoom, so a layer that doesn't split the two keeps one gate.
      const minZoom = renderMinZoom ?? activationMinZoom
      if (minZoom !== undefined && position.zoom < minZoom) {
        cleanup()
        return
      }

      // Skip when this layer's inputs (viewport + options) are unchanged and its
      // data is already loaded — so toggling one layer doesn't re-fetch the rest.
      const options = layerOptions[id] ?? {}
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      const key = `${position.zoom}|${sw.lng},${sw.lat},${ne.lng},${ne.lat}|${JSON.stringify(options)}`
      if (prevDataRef.current[id] && syncKey.current[id] === key) return
      syncKey.current[id] = key

      abortRefs.current[id]?.abort()
      const controller = new AbortController()
      abortRefs.current[id] = controller
      setLayerLoading(id, true)
      void (async () => {
        try {
          const data = await fetchData(
            bounds,
            controller.signal,
            options,
            position.zoom,
            o
          )

          const polygonProperty = markerLinkId(polygon)
          const prev = prevDataRef.current[id]
          const mergedData =
            polygonProperty && prev
              ? mergeWithPrevPolygons(data, prev, polygonProperty)
              : data
          prevDataRef.current[id] = mergedData
          if (o.publishData) setLayerData(id, mergedData)

          // Polygons (linked polygons, areas) stay on GL.
          addOverlayPolygons(map, o, mergedData, dark)

          // Wire polygon hover tooltip once after the fill layer is created.
          //
          // IMPORTANT: map.on('mousemove', layerId) and map.on('mouseleave', layerId)
          // rely on DOM mousemove reaching the canvas. The moment our popup appears
          // above the canvas it intercepts those events, Mapbox fires 'mouseleave',
          // onLeave removes the popup, onMove immediately re-adds it — 60fps flicker.
          //
          // Fix: listen on the map container — the popup lives inside it, so its
          // events bubble here instead of ending the hover — and use
          // map.queryRenderedFeatures, a direct WebGL query that does not depend on
          // which DOM element is under the cursor. Nothing above the map (a dialog's
          // backdrop, a drawer) reaches the container, so a modal also stops the
          // hover underneath it.
          // Polygon-hover tooltip — only for polygon-only overlays; marker overlays
          // (showOnMarkerHover) show the tooltip on marker hover instead.
          //
          // The cursor is deliberately NOT touched here: a tooltip is not a click
          // target. The pointer belongs to whoever registered the click —
          // `setupHoverState` under `useOverlaySelectsLocation` (selectable
          // polygons) and under `useParcelListings` (parcels holding listings) — so
          // it means "clickable", and each layer has exactly one owner for it.
          const hasPolygons = mergedData.features.some(polygonFeature)
          const polygonOnlyTooltip =
            o.tooltip && hasPolygons && !polygon?.showOnMarkerHover
          if (polygonOnlyTooltip && !polygonHoverCleanupRefs.current[id]) {
            const fillLayerId =
              o.tooltipLayerId ?? `${overlayPolygonId(o.id)}-fill`
            let hoveredLocationId: unknown = null

            const clearPopup = () => {
              if (hoveredLocationId === null) return
              hoveredLocationId = null
              if (activePolygonOverlayRef.current !== id) return
              activePolygonOverlayRef.current = null
              // A marker tooltip may have taken the popup after the polygon hover
              // started — don't evict it. Internal polygon state is already reset.
              if (popup.markerActiveRef.current) return
              popup.overlayPopupRef.current?.remove()
              popup.setOverlayPopup(null)
            }

            const hitTest = (e: MouseEvent) => {
              // A removed map keeps answering `getCanvas()` with undefined, and this
              // runs off the container's listener — outside the map's own teardown.
              const canvas = map.getCanvas()
              if (!canvas) return
              const canvasRect = canvas.getBoundingClientRect()
              const x = e.clientX - canvasRect.left
              const y = e.clientY - canvasRect.top
              const overCanvas =
                x >= 0 &&
                y >= 0 &&
                x <= canvasRect.width &&
                y <= canvasRect.height

              if (!overCanvas || !map.getLayer(fillLayerId)) {
                clearPopup()
                return
              }

              const features = map.queryRenderedFeatures([x, y], {
                layers: [fillLayerId]
              })

              if (!features.length) {
                clearPopup()
                return
              }

              const props = features[0].properties as Record<
                string,
                unknown
              > | null
              const locId = props?.locationId
              if (locId === hoveredLocationId) return
              // A marker tooltip is active — skip the polygon popup update but
              // don't advance hoveredLocationId so the polygon re-appears once
              // the marker is un-hovered and markerActiveRef goes back to false.
              if (popup.markerActiveRef.current) return

              hoveredLocationId = locId

              const lng = Number(props?.longitude)
              const lat = Number(props?.latitude)
              if (!Number.isFinite(lng) || !Number.isFinite(lat)) return

              const lngLat = new LngLat(lng, lat)
              activePolygonOverlayRef.current = id
              popup.overlayPopupRef.current?.setLngLat(lngLat).addTo(map)
              // Mapbox CSS: .mapboxgl-popup-content { pointer-events: auto }
              // This explicit rule on the content div overrides the wrapper's
              // inherited pointer-events, so the cursor still switches to text
              // and events still hit the popup. Override both synchronously here
              // (before React re-renders) to guarantee no flicker window.
              const popupEl = popup.overlayPopupRef.current?.getElement()
              if (popupEl) {
                const content = popupEl.querySelector(
                  '.mapboxgl-popup-content'
                ) as HTMLElement | null
                content?.style.setProperty(
                  'pointer-events',
                  'none',
                  'important'
                )
              }
              popup.setOverlayPopup({
                overlayId: id,
                lngLat,
                properties: props
              })
            }

            // One hit test per frame, at the latest pointer position: a high-rate
            // mouse fires several `mousemove`s between two frames, and every
            // `queryRenderedFeatures` walks the layer's geometry.
            let frame = 0
            const container = map.getContainer()
            const onMove = (e: MouseEvent) => {
              cancelAnimationFrame(frame)
              frame = requestAnimationFrame(() => hitTest(e))
            }
            // Leaving the container, onto a backdrop included, ends the hover.
            const onLeave = () => {
              cancelAnimationFrame(frame)
              clearPopup()
            }

            container.addEventListener('mousemove', onMove)
            container.addEventListener('mouseleave', onLeave)
            polygonHoverCleanupRefs.current[id] = () => {
              container.removeEventListener('mousemove', onMove)
              container.removeEventListener('mouseleave', onLeave)
              cancelAnimationFrame(frame)
            }
          }

          // Point markers render as DOM (0 markers when the data has no points).
          renderOverlayMarkers({
            map,
            overlay: o,
            data: mergedData,
            state: markersState(id),
            bbox: [sw.lng, sw.lat, ne.lng, ne.lat],
            zoom: position.zoom,
            dark,
            popup,
            selectedIds: selectedIdsRef.current
          })
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return
          console.error(`[useOverlayLayers:${id}]`, err)
        } finally {
          // A pan/zoom mid-flight aborts this request and starts a newer one,
          // which raised the flag again — only the current request may lower it,
          // otherwise the stale abort clears it while the new fetch is running.
          if (abortRefs.current[id] === controller) setLayerLoading(id, false)
        }
      })()
    })
  }

  // Keep latest sync function in a ref so the style.load listener (attached
  // once) always calls the up-to-date version with current bounds/zoom/options.
  const syncRef = useRef(syncOverlays)
  syncRef.current = syncOverlays

  // setStyle (map / hybrid / satellite) wipes all GL sources/layers, so polygons must
  // be re-added by the re-sync. DOM markers SURVIVE setStyle — recolour them in place
  // (the dark palette) instead of dropping + recreating, so they don't flicker out and
  // back. markersRefs is kept; the re-sync diff keeps them (same data → same keys).
  useMapListener(mapRef, (map) => {
    map.on('style.load', () => {
      Object.entries(abortRefs.current).forEach(([id, c]) => {
        c.abort()
        setLayerLoading(id, false)
      })
      Object.entries(markersRefs.current).forEach(([id, state]) => {
        const overlay = overlaysRef.current.find((o) => o.id === id)
        if (overlay) recolorOverlayMarkers(state, overlay, darkRef.current)
      })
      Object.values(polygonHoverCleanupRefs.current).forEach((fn) => fn())
      abortRefs.current = {}
      polygonHoverCleanupRefs.current = {}
      syncKey.current = {}
      prevDataRef.current = {}
      syncRef.current()
    })
  })

  useOverlayPopupDismiss()

  useEffect(() => {
    syncRef.current()
  }, [activeLayers, position.bounds, position.zoom, mapRef, layerOptions])

  // The polygon tooltip listens on the map container, which React keeps across
  // `map.remove()`, so nothing detaches it when the map goes away — and `map.remove()`
  // drops the canvas (`getCanvas()` then returns
  // undefined), so the next mouse move over a dead map throws. Strict mode's
  // double mount makes that every dev page load.
  //
  // The in-flight fetches are aborted for the same reason: the listener is attached
  // AFTER the await, so a request left running would attach one to the dead map long
  // after this cleanup had nothing left to remove.
  useEffect(
    () => () => {
      Object.values(abortRefs.current).forEach((controller) =>
        controller.abort()
      )
      Object.values(polygonHoverCleanupRefs.current).forEach((fn) => fn())
      abortRefs.current = {}
      polygonHoverCleanupRefs.current = {}
    },
    []
  )

  // Re-render one overlay's markers/polygons from locally-filtered data (e.g. the
  // listing-details school filters) without a re-fetch. Queries the cluster index
  // against the map's current viewport.
  const updateLayer = useCallback(
    (id: string, data: FeatureCollection) => {
      const map = mapRef?.current
      if (!map) return
      const overlay = overlays.find((o) => o.id === id)
      if (!overlay) return
      const dark = style === 'satellite' || style === 'hybrid'
      prevDataRef.current[id] = data
      addOverlayPolygons(map, overlay, data, dark)
      const bounds = map.getBounds()
      if (!bounds) return
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      renderOverlayMarkers({
        map,
        overlay,
        data,
        state: markersState(id),
        bbox: [sw.lng, sw.lat, ne.lng, ne.lat],
        zoom: map.getZoom(),
        dark,
        popup,
        selectedIds: selectedIdsRef.current
      })
    },
    [mapRef, style, overlays, popup]
  )

  return { updateLayer }
}

import { type RefObject, useEffect, useRef } from 'react'
import { type Position } from 'geojson'
import {
  type FitBoundsOptions,
  LngLat,
  type LngLatBounds,
  Map as MapboxMap
} from 'mapbox-gl'

import mapConfig from '@configs/map'

import { useMapOptions } from 'providers/MapOptionsProvider'
import {
  addPolygon,
  addRegionPolygon,
  getDefaultBounds,
  getMapStyleUrl,
  webglSupported
} from 'utils/map'
import { installBuildingWindows } from 'utils/map/buildingWindows'

export type MapMoveCallback = (
  bounds: LngLatBounds,
  center: LngLat,
  zoom: number
) => void

interface UseMapInitOptions {
  containerRef: RefObject<HTMLElement | null>
  center: LngLat | null
  zoom: number
  polygon?: Position[] | null
  /** Loaded saved-search region — the flat `map` ring list, regrouped into
   *  polygons + holes by containment, rendered read-only on the 'user' source. */
  region?: Position[][] | null
  /** Skip map construction entirely (e.g. static mode). Default: true. */
  enabled?: boolean
  /**
   * Override the initial viewport with explicit bounds instead of center+zoom.
   * When provided, `center` and `zoom` are ignored for the initial position.
   */
  initialBounds?: LngLatBounds
  /** Options passed to Mapbox `fitBounds` when `initialBounds` is set. */
  fitBoundsOptions?: FitBoundsOptions
  /**
   * Enable the scroll-to-zoom interaction. Defaults to true (Mapbox default).
   * Pass `false` when embedding the map inside a scrollable page to avoid
   * scroll-jacking.
   */
  scrollZoom?: boolean
  /**
   * Enable touch pinch-to-zoom and rotate gestures. Defaults to true.
   * Pass `false` to disable on touch devices (e.g. property detail card map).
   */
  touchZoomRotate?: boolean
  /** Override the minimum zoom level (overrides mapboxDefaults). */
  minZoom?: number
  /** Initial camera rotation in degrees (e.g. restored from the URL). */
  bearing?: number
  /** Initial camera tilt in degrees (e.g. restored from the URL). */
  pitch?: number
  /** Ref returned by use3DInteractions – map `moveend` is suppressed while rotating. */
  rotating?: RefObject<boolean>
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
  /** Called after each zoom gesture ends; receives the new zoom level. */
  onZoomEnd?: (zoom: number) => void
  onLoad?: MapMoveCallback
  onMove?: MapMoveCallback
  onClick?: () => void
  /** Side-effects to run once the MapboxMap instance is ready (e.g. MapService.setMap). */
  onInit?: (map: MapboxMap) => void
  /** Cleanup to run on unmount (e.g. MapService.removeMap). */
  onCleanup?: () => void
}

const { mapboxDefaults } = mapConfig

const noop = (): void => undefined

/**
 * Handles Mapbox map construction, event wiring, and cleanup.
 * Registers the map instance to MapOptionsProvider via `setMapRef`.
 *
 * Dependencies that change after mount (onLoad, onMove) are kept in refs
 * so map event handlers never see stale closures.
 */
export const useMapInit = ({
  containerRef,
  center,
  zoom,
  polygon,
  region,
  enabled = true,
  initialBounds,
  fitBoundsOptions,
  scrollZoom = true,
  touchZoomRotate = true,
  minZoom,
  bearing,
  pitch,
  rotating: rotatingProp,
  onInteractionStart = noop,
  onInteractionEnd = noop,
  onZoomEnd = noop,
  onLoad = noop,
  onMove = noop,
  onClick,
  onInit = noop,
  onCleanup = noop
}: UseMapInitOptions) => {
  const defaultRotatingRef = useRef(false)
  const rotating = rotatingProp ?? defaultRotatingRef

  const { style, setMapRef } = useMapOptions()

  // Stable refs so map event handlers always call the latest callbacks
  const onLoadRef = useRef(onLoad)
  const onMoveRef = useRef(onMove)
  // Guard against re-initialisation when `enabled` flips back to true after a
  // transient false (e.g. waiting for data in fitToListings mode).
  const initializedRef = useRef(false)

  useEffect(() => {
    onLoadRef.current = onLoad
  }, [onLoad])

  useEffect(() => {
    onMoveRef.current = onMove
  }, [onMove])

  useEffect(() => {
    if (!enabled || initializedRef.current || !containerRef.current) return
    // No WebGL (e.g. hardware acceleration off) — the Map constructor would
    // throw and crash the page; MapContainer renders the message instead.
    if (!webglSupported()) return
    initializedRef.current = true

    const { initialView } = mapConfig.searchArea
    const initialPosition = initialBounds
      ? { bounds: initialBounds, fitBoundsOptions }
      : center && zoom
        ? { center, zoom }
        : initialView
          ? {
              center: new LngLat(initialView.lng, initialView.lat),
              zoom: initialView.zoom
            }
          : { bounds: getDefaultBounds() }

    const map = new MapboxMap({
      container: containerRef.current,
      ...mapboxDefaults,
      style: getMapStyleUrl(style),
      ...initialPosition,
      scrollZoom,
      touchZoomRotate,
      ...(minZoom !== undefined && { minZoom }),
      ...(bearing !== undefined && { bearing }),
      ...(pitch !== undefined && { pitch })
    })

    installBuildingWindows(map)
    map.on('webglcontextrestored', () => installBuildingWindows(map))

    map.on('load', () => {
      if (polygon) addPolygon(map, polygon)
      // `region` is the saved-search `map`: a flat ring list mixing separate
      // areas and a single area's holes. addRegionPolygon regroups them by
      // containment so both render correctly — separate fills AND donut cut-outs.
      else if (region?.length) addRegionPolygon(map, region)
      // prevent stale closures in the `onLoad` and `onMove` callbacks
      onLoadRef.current(map.getBounds()!, map.getCenter(), map.getZoom())
    })

    map.on('moveend', () => {
      // Prevent fetching during 3D pitch/rotate interactions
      if (rotating.current) return
      // prevent stale closures in the `onLoad` and `onMove` callbacks
      onMoveRef.current(map.getBounds()!, map.getCenter(), map.getZoom())
    })

    // there is a slight difference between `dragstart` and `movestart` events,
    // as the drag/zoom could be initiated by the user ONLY and not the map
    // repositioning or animations
    map.on('dragstart', onInteractionStart)
    map.on('zoomstart', onInteractionStart)
    map.on('dragend', onInteractionEnd)
    map.on('zoomend', () => {
      onInteractionEnd()
      onZoomEnd(map.getZoom())
    })

    if (onClick) map.on('click', onClick)

    setMapRef(map)
    onInit(map)

    return () => {
      initializedRef.current = false
      map.remove()
      setMapRef(null)
      onCleanup()
    }
  }, [enabled])
}

/**
 * Scoped map state, initialized from URL params. Split into five contexts
 * (`useMapOptions`, `useMapLocations`, `useMapLayers`, `useMapPopup`, `useMapPopupActions`)
 * so a popup or layer update doesn't re-render the whole map tree. `position` is
 * value-deduped, which is why the search page's first fetch keys off `mapLoaded`.
 */
'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useSearchParams } from 'next/navigation'
import type { FeatureCollection } from 'geojson'
import { type LngLatBounds, type Map as MapboxMap, type Popup } from 'mapbox-gl'

import mapConfig from '@configs/map'
import paramsConfig from '@configs/params'
import { type MapStyle } from '@defaults/map'

import {
  type ApiGeoFilters,
  type ApiLocation,
  APILocations,
  type ApiLocationWithBounds
} from 'services/API'
import { toFilterArray } from 'utils/filters'
import { logError } from 'utils/log'
import {
  getCoords,
  getLocationsBounds,
  getPointBounds,
  getZoom
} from 'utils/map'
import { parseExternalLocationId } from 'utils/map/externalLocations'
import { parseLocationPath } from 'utils/urls'

import {
  mockMapLayers,
  mockMapLocations,
  mockMapOptions,
  mockMapPopupActions,
  mockMapPopupState
} from './mock'
import {
  type ListingPopupState,
  type MapEditMode,
  type MapLayer,
  type MapLayersContextProps,
  type MapLayout,
  type MapLocationsContextProps,
  type MapOptionsContextProps,
  type MapPopupActionsProps,
  type MapPopupStateProps,
  type MapPosition,
  type OverlayPopupState
} from './types'

const MapOptionsContext = createContext<MapOptionsContextProps | undefined>(
  undefined
)
const MapLocationsContext = createContext<MapLocationsContextProps | undefined>(
  undefined
)
const MapLayersContext = createContext<MapLayersContextProps | undefined>(
  undefined
)
const MapPopupStateContext = createContext<MapPopupStateProps | undefined>(
  undefined
)
const MapPopupActionsContext = createContext<MapPopupActionsProps | undefined>(
  undefined
)

const CENTER_POINT_RADIUS_KM = 5

const MapOptionsProvider = ({
  layout = 'map',
  style = 'map',
  title,
  // custom position used to initialize the map
  // on search results or saved searches polygon
  position,
  layers,
  children
}: {
  style: MapStyle
  layout: MapLayout
  title?: React.ReactNode | string
  position?: MapPosition
  layers?: MapLayer[]
  children?: React.ReactNode
}) => {
  const searchParams = useSearchParams()
  const mapRef = useRef<MapboxMap | null>(null)
  const [shadows, setShadows] = useState(false)
  // Style arrives via URL when it names a known style (allowlist — the value
  // ends up in the Mapbox style URL); otherwise the page default applies
  const [mapStyle, setStyle] = useState<MapStyle>(() => {
    const fromUrl = searchParams.get(paramsConfig.mapStyle)
    return fromUrl && fromUrl in mapConfig.mapStyles
      ? (fromUrl as MapStyle)
      : style
  })
  const [mapLayout, setLayout] = useState(layout)
  const [mapTitle, setMapTitle] = useState<React.ReactNode | null>(
    typeof title === 'string' ? title : null
  )
  const [titleLoading, setTitleLoading] = useState(false)
  const [titleBounds, setTitleBounds] = useState<LngLatBounds | null>(null)
  const [mapLocations, setMapLocations] = useState<ApiLocation[] | null>(null)
  const [locationBounds, setLocationBounds] = useState<LngLatBounds | null>(
    null
  )
  const [locationsLoading, setLocationsLoading] = useState(false)

  const [centerEnabled, setCenterEnabled] = useState(true)
  const [editMode, setEditMode] = useState<MapEditMode>(null)
  const clearEditMode = () => setEditMode(null)
  // 3D mode arrives pre-activated via URL (bare param or with orientation
  // values) only when the tenant has 3D enabled
  const [mode3D, setMode3D] = useState(
    () =>
      Boolean(mapConfig.map3D?.enabled) &&
      searchParams.get(paramsConfig.mode3D) !== null
  )
  const toggleMode3D = () => setMode3D(!mode3D)

  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(() => {
    const fromUrl = searchParams.getAll(paramsConfig.layers)
    return new Set([...(layers ?? []), ...(fromUrl as MapLayer[])])
  })

  const toggleLayer = (layer: MapLayer) =>
    setActiveLayers((prev) => {
      const next = new Set(prev)
      if (next.has(layer)) next.delete(layer)
      else next.add(layer)
      return next
    })

  const [loadingLayers, setLoadingLayers] = useState<Set<MapLayer>>(new Set())
  const setLayerLoading = (layer: MapLayer, loading: boolean) =>
    setLoadingLayers((prev) => {
      const next = new Set(prev)
      if (loading) next.add(layer)
      else next.delete(layer)
      return next
    })

  const [layerData, setLayerDataState] = useState<
    Record<string, FeatureCollection>
  >({})
  const setLayerData = (layer: MapLayer, data: FeatureCollection) =>
    setLayerDataState((prev) => ({ ...prev, [layer]: data }))

  const [layerOptions, setLayerOptionsState] = useState<
    Record<string, Record<string, boolean>>
  >({})

  const [overlayPopup, setOverlayPopup] = useState<OverlayPopupState | null>(
    null
  )
  const overlayPopupRef = useRef<Popup | null>(null)
  // Set by whichever overlay marker a tap opened; read by everything that has to
  // end that preview from outside the marker (a tap on empty map, the tooltip's
  // own selection button). Lives here next to the Popup ref for the same reason:
  // the marker handlers and the React tooltip are wired in different places.
  const closeOverlayMarkerRef = useRef<(() => void) | null>(null)
  const [listingPopup, setListingPopup] = useState<ListingPopupState | null>(
    null
  )
  const setLayerOption = (layerId: string, key: string, value: boolean) =>
    setLayerOptionsState((prev) => ({
      ...prev,
      [layerId]: { ...prev[layerId], [key]: value }
    }))

  const setTitle = (
    title: React.ReactNode,
    loading = false,
    bounds: LngLatBounds | null = null
  ) => {
    setMapTitle(title)
    setTitleLoading(loading)
    setTitleBounds(bounds)
  }

  const setLocations = (locations: ApiLocation[] | null) => {
    setMapLocations(locations)
    let bounds = locations?.length ? getLocationsBounds(locations) : null
    // LAST MILE SOLUTION
    if (!bounds && locations?.[0]?.map) {
      const { longitude, latitude } = locations[0].map
      // center point fallback
      bounds = getPointBounds({
        center: [Number(latitude), Number(longitude)],
        radius: CENTER_POINT_RADIUS_KM
      })
    }
    setLocationBounds(bounds)
  }

  const clearLocations = () => {
    setMapTitle(null)
    setTitleLoading(false)
    setTitleBounds(null)
    setLocations(null)
  }

  const initialPosition = useMemo(
    () => ({
      center: getCoords(searchParams),
      zoom: getZoom(searchParams)
    }),
    []
  )

  const [mapPosition, setPosition] = useState<MapPosition>(
    position || initialPosition
  )

  // Memoize position to avoid object reference changes when values are the same
  const positionKey = JSON.stringify(mapPosition)
  const stablePosition = useMemo(() => mapPosition, [positionKey])

  // Handle location parameter from URL - fetch and display in MapTitle
  useEffect(() => {
    const location = searchParams.getAll('location')
    const locationId = searchParams.getAll('locationId')
    const externalLocationId = searchParams.getAll('externalLocationId')

    if (
      !location?.length &&
      !locationId?.length &&
      !externalLocationId?.length
    ) {
      return
    }

    const fetchSearchParamsLocations = async () => {
      try {
        // Block listing requests until locations are fetched
        setLocationsLoading(true)
        // Disable recenter button during fetch
        setCenterEnabled(false)

        const promises: Promise<ApiLocationWithBounds[]>[] = []

        // Handle location paths (legacy)
        if (location?.length) {
          const allPaths = toFilterArray(location)

          // Deduplicate location paths to avoid multiple requests for the same location
          const seenPaths = new Set<string>()
          const locationPaths = allPaths.filter((path) => {
            if (seenPaths.has(path)) return false
            seenPaths.add(path)
            return true
          })

          // Track which geo-filters are already present in location paths
          const usedAreas = new Set<string>()
          const usedCities = new Set<string>()
          const usedHoods = new Set<string>()
          // Helper to get unused geo-filters from URL params
          const getUnusedFilters = (paramName: string, usedSet: Set<string>) =>
            toFilterArray(searchParams.getAll(paramName)).filter(
              (value) => !usedSet.has(value)
            )

          // Fetch all locations for all paths
          const locationPromises = locationPaths.map((path) => {
            const { area, city, neighborhood } = parseLocationPath(path)
            if (area) usedAreas.add(area)
            if (city) usedCities.add(city)
            if (neighborhood) usedHoods.add(neighborhood)

            const geoFilters: ApiGeoFilters = {}
            if (area) geoFilters.area = area
            if (city) geoFilters.city = city
            if (neighborhood) geoFilters.neighborhood = neighborhood

            return APILocations.fetchWithBounds(geoFilters)
          })

          // Get additional geo-filters from URL and filter out already used ones
          const areas = getUnusedFilters('area', usedAreas)
          const cities = getUnusedFilters('city', usedCities)
          const neighborhoods = getUnusedFilters('neighborhood', usedHoods)

          // Create additional fetch promises for remaining geo-filters
          const geoPromises = [
            ...areas.map((area) => APILocations.fetchWithBounds({ area })),
            ...cities.map((city) => APILocations.fetchWithBounds({ city })),
            ...neighborhoods.map((neighborhood) =>
              APILocations.fetchWithBounds({ neighborhood })
            )
          ]

          promises.push(...locationPromises, ...geoPromises)
        }

        // Handle locationId (new way)
        if (locationId?.length) {
          const allIds = toFilterArray(locationId)

          // Deduplicate IDs
          const seenIds = new Set<string>()
          const uniqueIds = allIds.filter((id) => {
            if (seenIds.has(id)) return false
            seenIds.add(id)
            return true
          })

          // Fetch locations by ID
          const idPromises = uniqueIds.map((id) =>
            APILocations.fetchWithBounds({ locationId: id })
          )

          promises.push(...idPromises)
        }

        // Handle external overlay locations (schools…) — resolved through the
        // owning overlay's resolver, not the Repliers /locations API.
        if (externalLocationId?.length) {
          const uniqueExternal = [...new Set(toFilterArray(externalLocationId))]
          const externalPromises = uniqueExternal.map(async (id) => {
            const parsed = parseExternalLocationId(
              id,
              mapConfig.overlays.layers
            )
            const overlay = mapConfig.overlays.layers.find(
              (o) => o.id === parsed?.overlayId
            )
            if (!parsed || !overlay?.external) {
              logError(`[externalLocation] unknown id: ${id}`)
              return []
            }
            try {
              const resolvedLoc = await overlay.external.resolveLocation(
                parsed.rest
              )
              return resolvedLoc ? [resolvedLoc as ApiLocationWithBounds] : []
            } catch (error) {
              logError(`[externalLocation] resolve failed for ${id}:`, error)
              return []
            }
          })

          promises.push(...externalPromises)
        }

        // Fetch all locations in parallel
        const results = await Promise.all(promises)
        const locations = results.flat()

        if (locations.length) {
          // Set locations with combined bounds for MapCenterButton
          setLocations(locations)
        }
      } catch (error) {
        logError('Error fetching locations from URL:', error)
      } finally {
        // Re-enable recenter button after fetch
        setCenterEnabled(true)
        // Unblock listing requests - locations are ready
        setLocationsLoading(false)
      }
    }

    fetchSearchParamsLocations()
  }, [])

  useEffect(() => {
    if (!mode3D) setShadows(false)
    if (mapStyle !== 'map') setShadows(false)
  }, [mode3D, mapStyle])

  // Volatile per-layer state in its own context so a layer toggle re-renders only
  // its readers (the menu + overlay sync), not every `useMapOptions` consumer.
  const layersValue = useMemo(
    () => ({
      activeLayers,
      toggleLayer,
      loadingLayers,
      setLayerLoading,
      layerData,
      setLayerData,
      layerOptions,
      setLayerOption
    }),
    [activeLayers, loadingLayers, layerData, layerOptions]
  )

  const contextValue = useMemo(
    () => ({
      position: stablePosition,
      setPosition,

      layout: mapLayout,
      setLayout: setLayout,

      style: mapStyle,
      setStyle,
      defaultStyle: style,

      title: mapTitle,
      titleBounds,
      setTitle,
      titleLoading,

      editMode,
      setEditMode,
      clearEditMode,

      mode3D,
      setMode3D,
      toggleMode3D,
      shadows,
      setShadows,
      toggleShadows: () => setShadows(!shadows),

      centerEnabled,
      setCenterEnabled,

      mapRef,
      setMapRef: (ref: MapboxMap | null) => (mapRef.current = ref)
    }),
    [
      mapLayout,
      stablePosition,
      mapStyle,
      mapTitle,
      titleBounds,
      titleLoading,
      editMode,
      mode3D,
      shadows,
      centerEnabled
    ]
  )

  // Selection state in its own context — a location toggle re-renders only its
  // readers (MapTitle, the selection hooks, the grid), not every useMapOptions
  // consumer (map controls, 3D buttons, style switches, popups…).
  const locationsValue = useMemo(
    () => ({
      locations: mapLocations,
      locationsLoading,
      locationBounds,
      setLocations,
      clearLocations
    }),
    [mapLocations, locationsLoading, locationBounds]
  )

  const popupState = useMemo(
    () => ({ overlayPopup, listingPopup }),
    [overlayPopup, listingPopup]
  )
  // Stable for the provider's lifetime — setters and the ref never change, so
  // set-only consumers (MapRoot, marker hooks) never re-render on a popup change.
  const popupActions = useMemo(
    () => ({
      setOverlayPopup,
      setListingPopup,
      overlayPopupRef,
      closeOverlayMarkerRef
    }),
    []
  )

  return (
    <MapOptionsContext.Provider value={contextValue}>
      <MapLocationsContext.Provider value={locationsValue}>
        <MapLayersContext.Provider value={layersValue}>
          <MapPopupActionsContext.Provider value={popupActions}>
            <MapPopupStateContext.Provider value={popupState}>
              {children}
            </MapPopupStateContext.Provider>
          </MapPopupActionsContext.Provider>
        </MapLayersContext.Provider>
      </MapLocationsContext.Provider>
    </MapOptionsContext.Provider>
  )
}

export default MapOptionsProvider

export const useMapOptions = () => {
  const context = useContext(MapOptionsContext)
  if (!context) {
    // console.error('useMapOptions must be used within a MapOptionsProvider')
    // WARN: potentially dangerous fallback
    return mockMapOptions
  }
  return context
}

export const useMapLocations = () => {
  const context = useContext(MapLocationsContext)
  if (!context) return mockMapLocations
  return context
}

export const useMapLayers = () => {
  const context = useContext(MapLayersContext)
  if (!context) return mockMapLayers
  return context
}

export const useMapPopup = () => {
  const context = useContext(MapPopupStateContext)
  if (!context) return mockMapPopupState
  return context
}

export const useMapPopupActions = () => {
  const context = useContext(MapPopupActionsContext)
  if (!context) return mockMapPopupActions
  return context
}

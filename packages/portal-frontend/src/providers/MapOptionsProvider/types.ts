import { type FeatureCollection, type GeoJsonProperties } from 'geojson'
import {
  type LngLat,
  type LngLatBounds,
  type Map as MapboxMap,
  type Popup
} from 'mapbox-gl'
import type React from 'react'

import { type MapStyle, type OverlayLayerDefinition } from '@defaults/map'

import { type ApiListing, type ApiLocation } from 'services/API'

export type OverlayPopupState = {
  /** OverlayLayerDefinition id — used to look up the tooltip component in the registry */
  overlayId: string
  lngLat: LngLat
  properties: GeoJsonProperties
  /** Opened by a tap, not a hover — touch has no hover preview, so the tooltip
   *  carries the interactions a desktop user gets from the marker itself. */
  touch?: boolean
  /** This overlay selects locations ON THIS MAP: `selectable: 'marker'` config plus
   *  the `onMarkerClick` that only the search map injects (`useOverlaySelectsLocation`).
   *  The PDP map renders the same overlays and tooltips with no selection behind them. */
  selectable?: boolean
}

export type ListingPopupState = {
  listing: ApiListing
  lng: number
  lat: number
}

export type MapPosition = {
  center: LngLat | null
  bounds?: LngLatBounds | null
  zoom: number
}

export type MapLayout = 'map' | 'grid' | 'chat'

export type MapEditMode = 'draw' | 'freehand' | 'highlight' | null

export type MapLayer = OverlayLayerDefinition['id']

/**
 * Location-selection state, split into its own context so selecting/deselecting
 * a location (e.g. clicking school overlay markers) only re-renders the
 * components that read the selection — not every `useMapOptions` consumer.
 */
export type MapLocationsContextProps = {
  // Selected locations rendered in MapTitle (SelectedLocations)
  locations: ApiLocation[] | null
  locationsLoading: boolean
  locationBounds: LngLatBounds | null
  setLocations: (locations: ApiLocation[] | null) => void
  clearLocations: () => void
}

/**
 * Volatile per-layer state, split into its own context so toggling a layer only
 * re-renders the few components that read it — not every `useMapOptions` consumer.
 */
export type MapLayersContextProps = {
  activeLayers: Set<MapLayer>
  toggleLayer: (layer: MapLayer) => void
  loadingLayers: Set<MapLayer>
  setLayerLoading: (layer: MapLayer, loading: boolean) => void
  /** Fetched features per overlay id, for overlays with `publishData`. */
  layerData: Record<string, FeatureCollection>
  setLayerData: (layer: MapLayer, data: FeatureCollection) => void
  layerOptions: Record<string, Record<string, boolean>>
  setLayerOption: (layerId: string, key: string, value: boolean) => void
}

export type MapOptionsContextProps = {
  position: MapPosition
  setPosition: (position: MapPosition) => void

  layout: MapLayout
  setLayout: (layout: MapLayout) => void

  style: MapStyle
  setStyle: (style: MapStyle) => void
  /** Style the page was mounted with; the URL carries `style` only when the
   * current one differs */
  defaultStyle: MapStyle

  title: React.ReactNode | null
  titleBounds: LngLatBounds | null
  setTitle: (
    title: React.ReactNode,
    loading?: boolean,
    bounds?: LngLatBounds | null
  ) => void
  titleLoading: boolean

  editMode: MapEditMode
  setEditMode: (mode: MapEditMode) => void
  clearEditMode: () => void

  mode3D: boolean
  setMode3D: (mode: boolean) => void
  toggleMode3D: () => void

  shadows: boolean
  setShadows: (enabled: boolean) => void
  toggleShadows: () => void

  centerEnabled: boolean
  setCenterEnabled: (enabled: boolean) => void

  mapRef: React.RefObject<MapboxMap | null>
  setMapRef: (ref: MapboxMap | null) => void
}

/**
 * Overlay tooltip popup state, split into its own context so showing/hiding a
 * tooltip on hover re-renders only the popup host — not every useMapOptions
 * consumer (that mass re-render was the hover/card lag).
 */
/**
 * Popup STATE — changes on every marker hover (show/hide). Split from the actions
 * so only the two popup hosts (OverlayMarkerPopup, ListingPopupHost) subscribe to
 * it; set-only consumers (MapRoot, marker hooks) read the stable actions instead
 * and never re-render on hover.
 */
export type MapPopupStateProps = {
  overlayPopup: OverlayPopupState | null
  /** Hovered listing marker → ListingPopupHost portals its card into a popup. */
  listingPopup: ListingPopupState | null
}

/** Popup ACTIONS + the Popup ref — stable for the provider's lifetime. */
export type MapPopupActionsProps = {
  setOverlayPopup: (state: OverlayPopupState | null) => void
  setListingPopup: (state: ListingPopupState | null) => void
  /**
   * Direct ref to the Mapbox Popup instance owned by OverlayMarkerPopup, used to
   * position it synchronously in the same mouseenter handler as setFeatureState.
   */
  overlayPopupRef: React.RefObject<Popup | null>
  /**
   * Closes the marker preview a tap opened — its tooltip, its linked polygon
   * highlight and its ring, which only the marker's own handlers know about.
   * Null while no preview is open.
   */
  closeOverlayMarkerRef: React.RefObject<(() => void) | null>
}

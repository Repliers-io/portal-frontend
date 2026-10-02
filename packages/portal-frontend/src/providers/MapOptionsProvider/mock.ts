import type React from 'react'

import {
  type MapEditMode,
  type MapLayersContextProps,
  type MapLayout,
  type MapLocationsContextProps,
  type MapOptionsContextProps,
  type MapPopupActionsProps,
  type MapPopupStateProps,
  type MapPosition
} from './types'

const noop = () => undefined

export const mockMapOptions: MapOptionsContextProps = {
  mapRef: { current: null },
  setMapRef: noop,

  position: {} as MapPosition,
  setPosition: noop,

  layout: 'map' as MapLayout,
  setLayout: noop,

  style: 'map',
  setStyle: noop,
  defaultStyle: 'map',

  title: null,
  titleBounds: null,
  setTitle: noop,
  titleLoading: false,

  centerEnabled: false,
  setCenterEnabled: noop,

  editMode: null as MapEditMode,
  setEditMode: noop,
  clearEditMode: noop,

  mode3D: false,
  setMode3D: noop,
  toggleMode3D: noop,

  shadows: false,
  setShadows: noop,
  toggleShadows: noop
}

export const mockMapLocations: MapLocationsContextProps = {
  locations: null,
  locationsLoading: false,
  locationBounds: null,
  setLocations: noop,
  clearLocations: noop
}

export const mockMapLayers: MapLayersContextProps = {
  activeLayers: new Set(),
  toggleLayer: noop,
  loadingLayers: new Set(),
  setLayerLoading: noop,
  layerData: {},
  setLayerData: noop,
  layerOptions: {},
  setLayerOption: noop
}

export const mockMapPopupState: MapPopupStateProps = {
  overlayPopup: null,
  listingPopup: null
}

export const mockMapPopupActions: MapPopupActionsProps = {
  setOverlayPopup: noop,
  setListingPopup: noop,
  overlayPopupRef: { current: null } as React.RefObject<null>,
  closeOverlayMarkerRef: { current: null } as React.RefObject<null>
}

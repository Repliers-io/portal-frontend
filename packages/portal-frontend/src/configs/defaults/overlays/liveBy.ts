import features from '@configs/features'
import { SchoolRoundedIcon } from '@configs/icons'
import type { OverlayLayerDefinition } from '@defaults/map'

import { fetchLocations } from 'utils/map/overlays'

export const livebyPostalCode: OverlayLayerDefinition = {
  locationTypes: ['postalCode'],
  id: 'livebyPostalCode',
  label: 'Postal Codes',
  tooltip: true,
  color: '#2E7D32',
  selectable: 'polygon',
  activationMinZoom: 10,
  polygon: { previewState: true },
  showOn: { search: true, listing: false },
  fetchData: (bounds, signal) =>
    fetchLocations(bounds, signal, {
      type: 'postalCode',
      source: 'LiveBy'
    })
}

export const livebySchoolDistrict: OverlayLayerDefinition = {
  locationTypes: ['schoolDistrict'],
  id: 'livebySchoolDistrict',
  label: 'School Districts',
  tooltip: true,
  color: '#9B111E',
  selectable: 'polygon',
  activationMinZoom: 11,
  polygon: { previewState: true },
  showOn: { search: true, listing: false },
  fetchData: (bounds, signal) =>
    fetchLocations(bounds, signal, {
      type: 'schoolDistrict',
      source: 'LiveBy'
    })
}

export const livebyNeighborhood: OverlayLayerDefinition = {
  locationTypes: ['neighborhood'],
  id: 'livebyNeighborhood',
  label: 'Neighborhoods',
  tooltip: true,
  color: '#1565C0',
  selectable: 'marker',
  activationMinZoom: 9,
  marker: { type: 'name' },
  polygon: { showOnMarkerHover: true, previewState: true },
  cluster: { radius: 60, maxZoom: 13, minPoints: 2 },
  // Default-active on the search map, but kept out of the MapLayersMenu list —
  // toggled from the standalone neighborhood button (wired in MapControls).
  showOn: { search: { active: true }, listing: false, menu: false },
  fetchData: (
    bounds,
    signal,
    _options,
    _zoom,
    { locationTypes = ['neighborhood'] }
  ) =>
    fetchLocations(bounds, signal, {
      type: locationTypes,
      source: 'LiveBy',
      markers: true
    })
}

export const livebySchool: OverlayLayerDefinition = {
  locationTypes: ['school'],
  id: 'livebySchool',
  label: 'Schools',
  tooltip: true,
  color: '#6A1B9A',
  selectable: 'marker',
  showOn: { search: { active: true }, listing: false },
  marker: {
    type: 'icon',
    icon: SchoolRoundedIcon,
    zIndex: 10
  },
  cluster: { radius: 50, maxZoom: 12, minPoints: 3 },
  polygon: { showOnMarkerHover: true, previewState: true },
  fetchData: (bounds, signal) =>
    fetchLocations(bounds, signal, {
      type: 'school',
      source: 'LiveBy',
      markers: true
    })
}

// List order in the layers menu: school sits under the school districts.
// (marker.zIndex puts school markers on top.)
export const overlayLayers = features.liveBy
  ? [livebyNeighborhood, livebyPostalCode, livebySchoolDistrict, livebySchool]
  : []

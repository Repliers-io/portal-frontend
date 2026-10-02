import features from '@configs/features'
import type { OverlayLayerDefinition } from '@defaults/map'

import { fetchParcels } from 'utils/map/overlays'
import { parcelsOverlayId } from 'utils/map/parcelLayers'

/**
 * Public-record parcels, served by `/api/public-record` — it pages the Repliers
 * assessor dataset (`type: 'property'`, `source: 'PublicRecord'`) for the viewport
 * and drops the duplicate rows that endpoint returns before the client sees them.
 *
 * The button flies to zoom 17, where a viewport is readable everywhere in Austin
 * (~150 parcels downtown, ~30 in the residential north). The render floor sits two
 * steps lower so panning out doesn't drop the layer; the densest viewport measured
 * there is downtown at zoom 15, around 9000 parcels, because every condo unit is its
 * own assessor record on the same footprint.
 */
const parcelsOverlay: OverlayLayerDefinition = {
  id: parcelsOverlayId,
  label: 'Parcels',
  color: '#4C5774',
  activationMinZoom: 17,
  renderMinZoom: 15,
  publishData: true,
  publicRecord: true,
  tooltip: true,
  polygon: {
    // Lot outlines are context under the listings, not a readable surface: thin
    // line, no fill. White and a touch more opaque over satellite imagery.
    style: {
      'line-color': '#4C5774',
      'line-width': 1,
      'line-opacity': 0.6,
      'fill-opacity': 0,

      satellite: {
        'line-color': '#FFFFFF',
        'line-opacity': 0.8
      }
    }
  },
  // The listing page draws this parcel alone over its house: solid white and twice
  // the width, the same on every map style — no satellite variant, so the override
  // wins in both.
  listingPolygon: {
    style: {
      'line-color': '#FFFFFF',
      'line-width': 2,
      'line-opacity': 1,
      'fill-opacity': 0
    },
    casing: {
      'line-color': '#000000',
      'line-width': 3,
      'line-opacity': 0.5
    }
  },
  // Driven by its own map control, like the neighborhoods overlay, so it stays out
  // of the layers list.
  showOn: { search: true, menu: false },
  // Read lazily: this file sits on the `@configs/map` → `utils/map/overlays` import
  // cycle (see `parcelLayers.ts`), so `fetchParcels` may not be initialised yet.
  fetchData: (bounds, signal) => fetchParcels(bounds, signal)
}

// The PublicRecord `/locations` source is an account entitlement: an account without
// it gets a 400 on the source itself, so the layer is not offered at all.
export const parcelsLayers = features.publicRecord ? [parcelsOverlay] : []

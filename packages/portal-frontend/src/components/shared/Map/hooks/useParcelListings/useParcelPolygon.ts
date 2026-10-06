'use client'

import { useEffect } from 'react'
import type { Feature, MultiPolygon, Polygon } from 'geojson'
import type { Map as MapboxMap } from 'mapbox-gl'

import { useMapOptions } from 'providers/MapOptionsProvider'
import {
  overlayById,
  overlayPolygonId,
  parcelsOverlayId,
  styleReady
} from 'utils/map'

import {
  addOverlayPolygons,
  removeOverlayPolygons
} from '../useOverlayLayers/layers'

// Undefined on every tenant whose map config carries no parcels overlay: nothing to
// style the polygon with, so nothing is drawn.
const parcelsOverlay = overlayById(parcelsOverlayId)

// The overlay's own source, and the outline the casing has to sit under.
const sourceId = overlayPolygonId(parcelsOverlayId)
const outlineLayerId = `${sourceId}-outline`
const casingLayerId = `${sourceId}-casing`

// The listing map dresses its single parcel differently from a viewport full of lot
// lines, when the overlay says how.
const listingOverlay = parcelsOverlay?.listingPolygon
  ? { ...parcelsOverlay, polygon: parcelsOverlay.listingPolygon }
  : parcelsOverlay

const casing = parcelsOverlay?.listingPolygon?.casing

const addCasing = (map: MapboxMap) => {
  if (!casing || map.getLayer(casingLayerId) || !map.getSource(sourceId)) return
  map.addLayer(
    {
      id: casingLayerId,
      source: sourceId,
      type: 'line',
      paint: {
        'line-color': casing['line-color'],
        'line-width': casing['line-width'],
        'line-opacity': casing['line-opacity']
      }
    },
    // Under the outline, so the white line keeps its colour and only gains an edge.
    map.getLayer(outlineLayerId) ? outlineLayerId : undefined
  )
}

const clear = (map: MapboxMap) => {
  // On unmount the map owner (a sibling ahead of this leaf) has already run
  // `map.remove()`, which drops the style — `getLayer` on it throws.
  if (!listingOverlay || !styleReady(map)) return
  if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId)
  removeOverlayPolygons(map, listingOverlay)
}

/**
 * Draws one parcel in the parcels overlay's own style — the same data the search map
 * draws, in the listing map's heavier paint. Who the parcel belongs to and where it
 * came from is the caller's business; this hook only paints it.
 */
export const useParcelPolygon = (
  parcel: Feature<Polygon | MultiPolygon> | null
) => {
  const { mapRef, position, style } = useMapOptions()

  // The map is ready once it has published a viewport — see the `onLoad` note in
  // HomeMap. Panning republishes the same truth, so this stays a single flip.
  const ready = Boolean(position.bounds)

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !listingOverlay) return
    // Nothing to draw any more: a listing whose lot was never matched.
    if (!parcel) {
      clear(map)
      return
    }

    const dark = style === 'satellite' || style === 'hybrid'
    const data = { type: 'FeatureCollection' as const, features: [parcel] }

    const draw = () => {
      addOverlayPolygons(map, listingOverlay, data, dark)
      addCasing(map)
    }
    draw()
    // A style switch wipes every GL layer; draw again once the new style has loaded.
    map.on('style.load', draw)

    return () => {
      map.off('style.load', draw)
    }
  }, [parcel, ready, style, mapRef])

  // Teardown belongs to unmount alone. Dropping the source whenever the parcel
  // changes and re-adding it a tick later is the blink — the parcel dialog swaps
  // the feature for its record-carrying copy without moving a vertex, and
  // `drawPolygon` answers a source that already exists with `setData`.
  useEffect(
    () => () => {
      const map = mapRef.current
      if (map) clear(map)
    },
    [mapRef]
  )
}

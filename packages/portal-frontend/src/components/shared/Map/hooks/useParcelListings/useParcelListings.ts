'use client'

import { useEffect, useRef } from 'react'
import type { FeatureCollection } from 'geojson'
import type {
  ExpressionSpecification,
  GeoJSONSource,
  Map as MapboxMap,
  MapLayerMouseEvent
} from 'mapbox-gl'

import gridConfig from '@configs/cards-grids'
import { markerColors } from '@configs/colors'
import features from '@configs/features'
import mapConfig from '@configs/map'
import { markerHover } from '@shared/Map/markerElement'
import { pointOnFeature } from '@turf/turf'

import type { ApiListing } from 'services/API'
import { type ParcelDialogProps, useDialog } from 'providers/DialogProvider'
import { useMapLayers, useMapOptions } from 'providers/MapOptionsProvider'
import { fetchParcelRecord, type ParcelFeature } from 'providers/ParcelProvider'
import { setupHoverState } from 'utils/map/hover'
import { overlayPolygonId } from 'utils/map/overlays'
import {
  parcelMatchedFillId,
  parcelMatchedLineId,
  parcelMatchedSourceId,
  parcelsOverlayId
} from 'utils/map/parcelLayers'
import { polygonFeature } from 'utils/map/polygons'
import { executeOnStyleLoad, styleReady } from 'utils/map/style'

import type { MarkerClickEvent } from '../useListingMarkers/useListingMarkers'
import { useMapListener } from '../useMapListener'

import type { ParcelGroup } from './grouping'
import { useParcelGroups } from './useParcelGroups'

// One colour per parcel without a colour property in the data: match the `id` that
// locationsToGeoJson already stamps on every feature. Only called with a non-empty
// list — a `match` expression needs at least one label/output pair.
const colorBy = (
  groups: ParcelGroup[],
  pick: (group: ParcelGroup) => string
): ExpressionSpecification =>
  [
    'match',
    ['get', 'id'],
    ...groups.flatMap((group) => [group.id, pick(group)]),
    markerColors.default.color
  ] as ExpressionSpecification

const onHover = (active: unknown, idle: unknown): ExpressionSpecification =>
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    active,
    idle
  ] as ExpressionSpecification

// `pointOnFeature` rather than a centroid: an L-shaped lot's centroid falls outside
// it, which would fly the map to the neighbour.
const parcelAnchor = (group: ParcelGroup): [number, number] => {
  const [lng, lat] = pointOnFeature(group.feature).geometry.coordinates
  return [lng, lat]
}

/**
 * Draws the parcels that hold listings, each in that listing's marker colour.
 *
 * These layers own their own source rather than reading the parcels overlay's. The
 * overlay drops its source whenever the layer is switched off, and Mapbox refuses to
 * remove a source another layer still uses — and effect order guarantees the
 * overlay's cleanup (a leaf) runs before this hook (a parent) could get out of the
 * way. Duplicating tens of matched polygons is the cheaper half of that trade.
 */
// Drops the layers and their source, in dependency order. Called when the groups run
// out and once on unmount — never between renders, which would rebuild the layers on
// every pan and make the polygons blink.
const removeLayers = (map: MapboxMap) => {
  if (map.getLayer(parcelMatchedLineId)) map.removeLayer(parcelMatchedLineId)
  if (map.getLayer(parcelMatchedFillId)) map.removeLayer(parcelMatchedFillId)
  if (map.getSource(parcelMatchedSourceId))
    map.removeSource(parcelMatchedSourceId)
}

type UseParcelListingsOptions = {
  /** Touch device — a tap flies the parcel clear of the drawer, then opens it. */
  touch: boolean
  onListingClick: (
    event: MarkerClickEvent,
    listing: ApiListing,
    multiUnit: boolean
  ) => void
  onListingTap: (listing: ApiListing, multiUnit: boolean) => void
}

/**
 * Puts the pair back on top, outline above fill.
 *
 * `setStyle` drops every runtime layer, and this hook and the parcels overlay each
 * re-add theirs from their own `style.load` listener — so which ends up above the
 * other is decided by listener registration order, which is to say undefined. Rather
 * than depend on winning that race, re-assert the order on every render.
 */
const raiseLayers = (map: MapboxMap) => {
  if (map.getLayer(parcelMatchedFillId)) map.moveLayer(parcelMatchedFillId)
  if (map.getLayer(parcelMatchedLineId)) map.moveLayer(parcelMatchedLineId)
}

export const useParcelListings = ({
  touch,
  onListingClick,
  onListingTap
}: UseParcelListingsOptions) => {
  const { mapRef } = useMapOptions()
  const { showDialog: showParcel } = useDialog<ParcelDialogProps>('parcel')
  const { groups, pending } = useParcelGroups()
  // The parcels overlay's data, read inside the click handler attached once.
  const { layerData } = useMapLayers()
  const layerDataRef = useRef(layerData)
  layerDataRef.current = layerData
  const renderRef = useRef<(() => void) | null>(null)
  const hoverRef = useRef<{ cleanup: () => void } | null>(null)
  // Read inside the hover handlers, which are attached once and outlive any single
  // groups value.
  const groupsRef = useRef(new Map<string, ParcelGroup>())
  groupsRef.current = new Map(groups.map((group) => [group.id, group]))

  // Read inside the map handlers, which are attached once and outlive any single
  // render, so they must never close over a stale callback.
  const optionsRef = useRef({ touch, onListingClick, onListingTap })
  optionsRef.current = { touch, onListingClick, onListingTap }

  const dropHover = () => {
    hoverRef.current?.cleanup()
    hoverRef.current = null
  }

  useEffect(() => {
    const map = mapRef?.current
    if (!map) return
    // Parcels in flight: the groups are being recomputed against a viewport that is
    // half old. Hold rather than repaint an interim frame.
    if (pending) return

    const render = () => {
      if (!groups.length) {
        dropHover()
        removeLayers(map)
        return
      }

      const data: FeatureCollection = {
        type: 'FeatureCollection',
        features: groups.map((group) => group.feature)
      }
      const idle = colorBy(groups, (group) => group.color)
      const active = colorBy(groups, (group) => group.hoverColor)

      const source = map.getSource(parcelMatchedSourceId) as
        | GeoJSONSource
        | undefined
      // A style switch can leave the source behind without its layers. Updating that
      // paints nothing and returns, so treat it as absent and rebuild.
      const drawn =
        map.getLayer(parcelMatchedFillId) && map.getLayer(parcelMatchedLineId)

      if (source && drawn) {
        source.setData(data)
        map.setPaintProperty(
          parcelMatchedFillId,
          'fill-color',
          onHover(active, idle)
        )
        map.setPaintProperty(parcelMatchedLineId, 'line-color', idle)
        raiseLayers(map)
        return
      }

      removeLayers(map)

      // `promoteId` keeps feature-state pinned to the parcel across every setData —
      // the default `generateId` numbers features by array index, which shifts.
      map.addSource(parcelMatchedSourceId, {
        type: 'geojson',
        data,
        promoteId: 'id'
      })

      map.addLayer({
        id: parcelMatchedFillId,
        source: parcelMatchedSourceId,
        type: 'fill',
        paint: {
          'fill-color': onHover(active, idle),
          'fill-opacity': onHover(0.3, 0.15)
        }
      })

      map.addLayer({
        id: parcelMatchedLineId,
        source: parcelMatchedSourceId,
        type: 'line',
        paint: {
          'line-color': idle,
          'line-width': onHover(2, 1)
        }
      })

      // The parcel drives its price marker's hover. While the pointer is on the parcel
      // the marker's own mouse events do nothing (`onParcel`).
      // Re-attached here because a style switch recreates the layer it binds to.
      raiseLayers(map)

      dropHover()

      const markerOf = (id: string | number) => {
        const group = groupsRef.current.get(String(id))
        return group && markerHover(group.representative.mlsNumber)
      }
      const hover = setupHoverState(
        map,
        parcelMatchedSourceId,
        parcelMatchedFillId,
        {
          onEnter: (id) => {
            const marker = markerOf(id)
            if (!marker || optionsRef.current.touch) return
            marker.onParcel = true
            marker.enter()
          },
          onLeave: (id) => {
            const marker = markerOf(id)
            if (!marker) return
            marker.onParcel = false
            marker.leave()
          }
        }
      )

      // Opens the very same thing a price marker opens: the browser dialog on a
      // wide screen, the listing drawer on touch.
      const onClick = (event: MapLayerMouseEvent) => {
        const id = event.features?.[0]?.properties?.id
        const group = groupsRef.current.get(String(id))
        if (!group) return

        const { representative, listings } = group
        const multiUnit = listings.length > 1
        const options = optionsRef.current

        if (!options.touch) {
          options.onListingClick(event.originalEvent, representative, multiUnit)
          return
        }

        // The move a marker tap makes: lift the parcel above where the drawer will
        // sit, then open it — otherwise the drawer covers what was just tapped.
        const pixels = map.project(parcelAnchor(group))
        pixels.y += Number(gridConfig.listingCardSizes.drawer.height) / 2
        map.flyTo({ center: map.unproject(pixels), ...mapConfig.mapFlyCurve })
        map.once('moveend', () =>
          optionsRef.current.onListingTap(representative, multiUnit)
        )
      }
      map.on('click', parcelMatchedFillId, onClick)

      hoverRef.current = {
        cleanup: () => {
          hover.cleanup()
          map.off('click', parcelMatchedFillId, onClick)
        }
      }
    }

    renderRef.current = render
    return executeOnStyleLoad(map, render)
  }, [groups, pending, mapRef])

  // Teardown belongs to unmount alone. Doing it in the effect above would drop the
  // source on every groups change and re-add it a tick later — the blink.
  useEffect(
    () => () => {
      dropHover()
      const map = mapRef?.current
      if (map && styleReady(map)) removeLayers(map)
    },
    [mapRef]
  )

  // setStyle (map / satellite / hybrid) wipes every GL source and layer, and this
  // effect has no reason to re-run afterwards — redraw from the style itself.
  useMapListener(mapRef, (map) => {
    map.on('style.load', () => renderRef.current?.())

    if (!features.publicRecord) return
    // A parcel without a listing opens the parcel dialog. One with listings is covered
    // by the matched fill above, whose click opens the listing.
    const fillId = `${overlayPolygonId(parcelsOverlayId)}-fill`
    map.on('click', fillId, (event) => {
      const id = event.features?.[0]?.properties?.id
      if (typeof id !== 'string' || groupsRef.current.has(id)) return
      // The overlay's own features, not the rendered ones, which are clipped to
      // their tile. All of the viewport's listing-less parcels travel with the
      // clicked one as the set its arrows step through — in the address order
      // `/api/public-record` sorts by, and frozen while the dialog covers the map.
      const parcels = (
        layerDataRef.current[parcelsOverlayId]?.features ?? []
      ).filter(
        (feature) =>
          polygonFeature(feature) &&
          !groupsRef.current.has(String(feature.properties?.id))
      ) as ParcelFeature[]
      const index = parcels.findIndex(
        (feature) => feature.properties?.id === id
      )
      if (index < 0) return
      // With its record, so the dialog opens complete — facts, height and all.
      fetchParcelRecord(parcels[index], new AbortController().signal)
        .then((withRecord) => {
          if (withRecord) parcels[index] = withRecord
          showParcel({ parcels, index })
        })
        .catch((error: unknown) => console.error('[useParcelListings]', error))
    })
    // Every parcel is clickable, so every parcel gets the pointer — through the hover
    // mechanism the matched fill uses; the overlay's paint ignores the hover state.
    setupHoverState(map, overlayPolygonId(parcelsOverlayId), fillId)
  })
}

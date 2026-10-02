import { type Feature, type MultiPolygon, type Polygon } from 'geojson'
import { type LngLat, type Point } from 'mapbox-gl'

import MapboxDraw from '@mapbox/mapbox-gl-draw'

import { untangle } from 'utils/map'

import { freehandFillMeta, freehandStepPx } from './constants'
import { closingEdgeCrosses, freehandRing, lastSegmentCrosses } from './utils'

type FreehandState = {
  polygon: MapboxDraw.DrawPolygon
  // Screen position of the last committed stroke point
  last: Point | null
  // The stroke has crossed itself — for good: committed segments never move
  crossed: boolean
  // The finished area as drawn on the map (a figure-8 → its lobes); null while drawing
  shape: Polygon | MultiPolygon | null
}

const { activeStates, cursors } = MapboxDraw.constants

// The ring's trailing vertex follows the pointer on EVERY drag, so the feature
// changes on each render and stays in gl-draw's `hot` source — an unchanged one is
// moved to `cold`, and that swap between two async sources blinks. It is committed
// (a new trailing vertex starts) only `freehandStepPx` from the last committed
// point — the in-stroke thinning.
const extend = (
  state: FreehandState,
  { point, lngLat: { lng, lat } }: { point: Point; lngLat: LngLat }
) => {
  const { polygon, last, shape } = state
  if (shape) return
  const [ring] = polygon.coordinates
  if (last) polygon.updateCoordinate(`0.${ring.length - 1}`, lng, lat)
  else polygon.addCoordinate('0.0', lng, lat)
  if (last && point.dist(last) < freehandStepPx) return
  polygon.addCoordinate(`0.${ring.length}`, lng, lat)
  state.last = point
  // The segment just committed (the trailing vertex is not part of it)
  state.crossed ||= lastSegmentCrosses(ring.slice(0, -1))
}

const release = (mode: MapboxDraw.DrawCustomModeThis, state: FreehandState) => {
  const { polygon, last, shape } = state
  if (shape || !last) return

  // getCoordinates closes the ring: fewer than 3 points is no area — start over
  const [ring] = polygon.getCoordinates()
  if (ring.length < 4) {
    polygon.setCoordinates([[]])
    state.last = null
    return
  }

  const finished = freehandRing(ring, mode.map.getZoom())
  // Draw keeps rings open (it re-closes them on output)
  polygon.setCoordinates([finished.slice(0, -1)])
  state.shape = untangle(finished)
  mode.map.dragPan.enable()
  mode.map.fire('draw.create', { features: [polygon.toGeoJSON()] })
}

/**
 * gl-draw mode for the freehand search area: hold the button and draw one
 * stroke. On release the ring is simplified, untangled and rounded, then reported
 * through `draw.create` like the point tool's polygon. The finished polygon
 * renders inactive and ignores input — it never enters a select mode, so there
 * are no vertex handles to edit; only clearing the tool removes it.
 */
export const freehandMode: MapboxDraw.DrawCustomMode<FreehandState> = {
  onSetup() {
    const polygon = this.newFeature({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [[]] }
    }) as MapboxDraw.DrawPolygon
    this.addFeature(polygon)
    // Otherwise the stroke pans the map
    this.map.dragPan.disable()
    this.updateUIClasses({ mouse: cursors.ADD })
    return { polygon, last: null, crossed: false, shape: null }
  },

  onDrag(state, e) {
    extend(state, e)
  },

  onTouchMove(state, e) {
    extend(state, e)
  },

  onMouseUp(state) {
    release(this, state)
  },

  onTouchEnd(state) {
    release(this, state)
  },

  // Switching tools mid-stroke (removing the control restores it by itself)
  onStop() {
    this.map.dragPan.enable()
  },

  toDisplayFeatures(state, geojson, display) {
    const feature = geojson as Feature<Polygon>
    // Finished → the untangled shape on the inactive polygon layers, like the
    // point tool's deselected polygon
    if (state.shape) {
      feature.properties!.active = activeStates.INACTIVE
      return display({ ...feature, geometry: state.shape })
    }
    // Drawing → the active fill without the closing edge: the polygon, as a derived
    // feature the stroke layers skip, plus the open stroke on gl-draw's line layer
    const stroke = feature.geometry.coordinates[0].slice(0, -1)
    if (stroke.length < 2) return
    // earcut fills a self-crossing ring wrongly: no fill while the stroke or the
    // edge back to its start crosses it (the release shows the untangled shape)
    if (!state.crossed && !closingEdgeCrosses(stroke)) {
      const { id, ...properties } = feature.properties!
      display({
        ...feature,
        properties: {
          ...properties,
          parent: id,
          meta: freehandFillMeta,
          active: activeStates.ACTIVE
        }
      })
    }
    display({
      ...feature,
      geometry: { type: 'LineString', coordinates: stroke }
    })
  }
}

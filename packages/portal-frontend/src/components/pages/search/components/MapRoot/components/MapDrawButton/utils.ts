import { type Position } from 'geojson'

import { polygon, simplify, truncate } from '@turf/turf'

import { untangle } from 'utils/map'

import {
  freehandMaxVertices,
  freehandPrecision,
  freehandSimplifyPx
} from './constants'

// Screen px → degrees at `zoom` (Mapbox renders the world as a 512px tile at zoom 0)
const pxToDegrees = (px: number, zoom: number) => (px * 360) / (512 * 2 ** zoom)

// Douglas–Peucker at a screen-px tolerance, loosened until the ring fits the
// vertex budget (a closed ring repeats its first vertex).
const simplifyRing = (ring: Position[], zoom: number) => {
  let tolerance = pxToDegrees(freehandSimplifyPx, zoom)
  let simple: Position[]
  do {
    simple = simplify(polygon([ring]), { tolerance, highQuality: true })
      .geometry.coordinates[0]
    tolerance *= 1.5
  } while (simple.length - 1 > freehandMaxVertices)
  return simple
}

// Repliers searches a self-crossing ring even-odd, so a loop drawn twice would
// cut a hole in the middle: keep the untangled outline. A figure-8 stays as
// drawn — the API searches every lobe; only its fill is drawn untangled.
const searchRing = (ring: Position[]) => {
  const shape = untangle(ring)
  return shape.type === 'Polygon' ? shape.coordinates[0] : ring
}

// Which side of line pq the point r lies on (0 — on the line)
const side = (p: Position, q: Position, r: Position) =>
  Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]))

// Segments ab and cd cross properly — a shared endpoint or a touch doesn't count
const segmentsCross = (a: Position, b: Position, c: Position, d: Position) =>
  side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0

/** The stroke's newest segment crosses an earlier one (its neighbour shares an
 *  endpoint, so it is skipped). O(n) — run once per committed point. */
export const lastSegmentCrosses = (stroke: Position[]) => {
  const [a, b] = stroke.slice(-2)
  return stroke
    .slice(0, -2)
    .some(
      (point, i, earlier) => i > 0 && segmentsCross(a, b, earlier[i - 1], point)
    )
}

/** The closing edge (last point → first) crosses the stroke, skipping the two
 *  segments that share its endpoints. O(n) — cheap enough for every render. */
export const closingEdgeCrosses = (stroke: Position[]) => {
  const [first] = stroke
  const last = stroke[stroke.length - 1]
  return stroke
    .slice(1, -1)
    .some(
      (point, i, inner) =>
        i > 0 && segmentsCross(last, first, inner[i - 1], point)
    )
}

/** A finished freehand stroke (closed ring) as the search ring: simplified to the
 *  vertex budget, untangled, rounded to ~1 m. */
export const freehandRing = (ring: Position[], zoom: number) =>
  truncate(polygon([searchRing(simplifyRing(ring, zoom))]), {
    precision: freehandPrecision
  }).geometry.coordinates[0]

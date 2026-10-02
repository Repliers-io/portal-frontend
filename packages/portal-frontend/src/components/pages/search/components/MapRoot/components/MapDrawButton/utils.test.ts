import { type Position } from 'geojson'

import { booleanPointInPolygon, kinks, polygon } from '@turf/turf'

import { freehandMaxVertices } from './constants'
import { closingEdgeCrosses, freehandRing, lastSegmentCrosses } from './utils'

const zoom = 12

// A "C" drawn clockwise from its top tip: the stroke never crosses itself, and
// the edge back to the start stays outside it
const cShape: Position[] = [
  [10, 10],
  [0, 10],
  [0, 0],
  [10, 0]
]

describe('lastSegmentCrosses', () => {
  it('flags the stroke crossing itself', () => {
    expect(lastSegmentCrosses([...cShape, [5, 15]])).toBe(true)
  })

  // Consecutive segments share an endpoint — that is not a crossing
  it('ignores the neighbouring segment', () => {
    expect(lastSegmentCrosses(cShape)).toBe(false)
  })
})

describe('closingEdgeCrosses', () => {
  it('flags the edge back to the start cutting through the stroke', () => {
    // A hook: the stroke curls back inside the "C", so the way back to the start
    // (4,4)→(10,10) cuts its last turn at (6,6)
    expect(closingEdgeCrosses([...cShape, [10, 6], [4, 6], [4, 4]])).toBe(true)
  })

  it('ignores the segments that share its endpoints', () => {
    expect(closingEdgeCrosses(cShape)).toBe(false)
  })
})

describe('freehandRing', () => {
  it('loosens the simplification until a jagged stroke fits the vertex budget', () => {
    // 2000-point circle with ±0.002° radial zigzag — far above the 3px tolerance
    const stroke: Position[] = Array.from({ length: 2000 }, (_, i) => {
      const angle = (i / 2000) * 2 * Math.PI
      const radius = 0.05 + (i % 2 ? 0.002 : -0.002)
      return [
        -97.74 + radius * Math.cos(angle),
        30.26 + radius * Math.sin(angle)
      ]
    })
    stroke.push(stroke[0])

    const ring = freehandRing(stroke, zoom)

    expect(ring.length - 1).toBeLessThanOrEqual(freehandMaxVertices)
    expect(ring[0]).toEqual(ring[ring.length - 1])
  })

  it('replaces a loop drawn twice with its outline, so the middle is not a hole', () => {
    const twice: Position[] = [
      [-97.78, 30.22],
      [-97.7, 30.22],
      [-97.7, 30.3],
      [-97.78, 30.3],
      [-97.77, 30.23],
      [-97.71, 30.23],
      [-97.71, 30.29],
      [-97.77, 30.29],
      [-97.78, 30.22]
    ]

    const ring = freehandRing(twice, zoom)

    expect(kinks(polygon([ring])).features).toHaveLength(0)
    expect(booleanPointInPolygon([-97.74, 30.26], polygon([ring]))).toBe(true)
  })

  it('keeps a figure-8 as drawn, rounded to ~1 m', () => {
    const bowtie: Position[] = [
      [-97.780000123, 30.220000456],
      [-97.700000123, 30.300000456],
      [-97.700000123, 30.220000456],
      [-97.780000123, 30.300000456],
      [-97.780000123, 30.220000456]
    ]

    expect(freehandRing(bowtie, zoom)).toEqual([
      [-97.78, 30.22],
      [-97.7, 30.3],
      [-97.7, 30.22],
      [-97.78, 30.3],
      [-97.78, 30.22]
    ])
  })
})

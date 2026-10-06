import type { Position } from 'geojson'

import { groupRingsByContainment, untangle } from './polygons'

// Closed square rings (first === last), as saved-search `map` rings come.
const square = (x: number, y: number, size: number): Position[] => [
  [x, y],
  [x, y + size],
  [x + size, y + size],
  [x + size, y],
  [x, y]
]

const areaA = square(0, 0, 10)
const holeInA = square(2, 2, 2)
const areaB = square(20, 20, 10)

describe('groupRingsByContainment', () => {
  // The two disjoint merged locations must stay two independent filled polygons,
  // NOT collapse into one polygon whose second ring becomes a hole.
  it('keeps disjoint rings as separate outer polygons', () => {
    const result = groupRingsByContainment([areaA, areaB])

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual([areaA])
    expect(result[1]).toEqual([areaB])
  })

  // A ring nested inside another is a genuine hole and must cut out, NOT render
  // as a separate filled polygon on top.
  it('attaches a nested ring as a hole of its outer polygon', () => {
    const result = groupRingsByContainment([areaA, holeInA])

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual([areaA, holeInA])
  })

  // Both semantics at once: a donut area plus a separate area — the whole reason
  // no single global interpretation works.
  it('handles a donut and a disjoint area together', () => {
    const result = groupRingsByContainment([areaA, holeInA, areaB])

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual([areaA, holeInA])
    expect(result[1]).toEqual([areaB])
  })

  it('returns a single-ring polygon for a lone ring', () => {
    expect(groupRingsByContainment([areaA])).toEqual([[areaA]])
  })
})

describe('untangle', () => {
  // earcut fills a self-crossing ring wrongly — a figure-8 must become its lobes
  it('splits a figure-8 into two simple lobes', () => {
    const figure8: Position[] = [
      [0, 0],
      [10, 10],
      [10, 0],
      [0, 10],
      [0, 0]
    ]

    const shape = untangle(figure8)

    expect(shape.type).toBe('MultiPolygon')
    expect(shape.coordinates).toHaveLength(2)
  })

  // The ring can come from a hand-edited URL: an open ring must not throw
  it('draws a malformed ring as is', () => {
    const open = areaA.slice(0, -1)

    expect(untangle(open)).toEqual({ type: 'Polygon', coordinates: [open] })
  })

  // turf's `kinks` reports these, but unkink/union throw on them — a saved
  // boundary touching itself must still render, not crash the map load
  it('draws a self-touching ring as is', () => {
    const vertexOnEdge: Position[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [5, 0],
      [0, 10],
      [0, 0]
    ]
    const vertexTwice: Position[] = [
      [0, 0],
      [10, 0],
      [5, 5],
      [10, 10],
      [0, 10],
      [5, 5],
      [0, 0]
    ]

    expect(untangle(vertexOnEdge).coordinates).toEqual([vertexOnEdge])
    expect(untangle(vertexTwice).coordinates).toEqual([vertexTwice])
  })
})

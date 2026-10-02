import type { Feature, MultiPolygon, Polygon, Position } from 'geojson'

import { booleanPointInPolygon, multiPolygon, polygon } from '@turf/turf'

import { type ApiLocation, APILocations } from 'services/API'

import { resolveLocationBoundaries, unionAreas } from './utils'

// Axis-aligned square ring centred on (cx, cy) with half-size r.
const square = (cx: number, cy: number, r: number): Position[] => [
  [cx - r, cy - r],
  [cx + r, cy - r],
  [cx + r, cy + r],
  [cx - r, cy + r],
  [cx - r, cy - r]
]

const asFeature = (
  coords: Position[][] | Position[][][]
): Feature<Polygon | MultiPolygon> =>
  Array.isArray(coords[0][0][0])
    ? multiPolygon(coords as Position[][][])
    : polygon(coords as Position[][])

describe('resolveLocationBoundaries', () => {
  afterEach(() => jest.restoreAllMocks())

  it('uses carried boundaries and fetches missing native ones', async () => {
    const external = {
      locationId: 'schools-208-e1s1p1c1f0',
      external: true,
      map: { boundary: [square(-79.4, 43.7, 0.05)] }
    } as unknown as ApiLocation
    const native = {
      locationId: 'CAONNBBYBDGOHE',
      type: 'neighborhood'
    } as ApiLocation

    const fetchSpy = jest.spyOn(APILocations, 'fetch').mockResolvedValue({
      locations: [
        {
          locationId: 'CAONNBBYBDGOHE',
          map: { boundary: [square(-79.4, 43.7, 0.02)] }
        }
      ]
    } as never)

    const boundaries = await resolveLocationBoundaries([external, native])

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ locationId: 'CAONNBBYBDGOHE' })
    )
    expect(boundaries).toHaveLength(2)
  })

  it('skips locations that resolve to no polygon', async () => {
    const boundaryless = {
      locationId: 'CAONNBNOPOLY',
      type: 'neighborhood'
    } as ApiLocation

    jest.spyOn(APILocations, 'fetch').mockResolvedValue({
      locations: [{ locationId: 'CAONNBNOPOLY', map: {} }]
    } as never)

    expect(await resolveLocationBoundaries([boundaryless])).toEqual([])
  })
})

describe('unionAreas', () => {
  it('merges overlapping areas without subtracting the inner one', () => {
    // Concatenated rings would read the inner ring as a HOLE; a real union keeps
    // the whole outer square filled.
    const outer: Position[][] = [square(-79.35, 43.67, 0.05)]
    const inner: Position[][] = [square(-79.35, 43.67, 0.01)]

    const feature = asFeature(unionAreas([outer, inner])!)

    expect(booleanPointInPolygon([-79.35, 43.67], feature)).toBe(true)
    expect(booleanPointInPolygon([-79.35, 43.71], feature)).toBe(true)
  })

  it('flattens a disjoint union to one Polygon (the saved map rejects a MultiPolygon)', () => {
    const a: Position[][] = [square(-79.5, 43.6, 0.02)]
    const b: Position[][] = [square(-79.2, 43.8, 0.02)]

    const result = unionAreas([a, b])!

    // A single Polygon (coords[0][0][0] is a number), never a MultiPolygon.
    expect(Array.isArray(result[0][0][0])).toBe(false)
    // The primary area is kept.
    expect(booleanPointInPolygon([-79.5, 43.6], asFeature(result))).toBe(true)
  })

  it('dissolves a single MultiPolygon area whose parts overlap', () => {
    // 3 chain-overlapping squares grouped as ONE MultiPolygon area must merge,
    // not pass through as separate polygons.
    const multi: Position[][][] = [
      [square(0, 0, 1)],
      [square(1, 0, 1)],
      [square(2, 0, 1)]
    ]

    const result = unionAreas([multi])!

    // A dissolved result is a single Polygon (coords[0][0][0] is a number),
    // not a 3-polygon MultiPolygon (coords[0][0][0] would be a coordinate).
    expect(Array.isArray(result[0][0][0])).toBe(false)
    expect(booleanPointInPolygon([0, 0], asFeature(result))).toBe(true)
    expect(booleanPointInPolygon([2, 0], asFeature(result))).toBe(true)
  })

  it('returns null for no areas', () => {
    expect(unionAreas([])).toBeNull()
  })
})

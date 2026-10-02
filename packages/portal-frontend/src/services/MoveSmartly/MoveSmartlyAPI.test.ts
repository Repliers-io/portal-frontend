import type { Geometry } from 'geojson'

import { computeSchoolBboxes } from './MoveSmartlyAPI'
import type { School, SchoolBoundary } from './types'

const polygon = (ring: [number, number][]): Geometry => ({
  type: 'Polygon',
  coordinates: [ring]
})

const boundary = (over: Partial<SchoolBoundary>): SchoolBoundary =>
  ({
    isEnglish: true,
    isElementary: false,
    isMiddle: false,
    isHigh: true,
    isFrenchImmersion: false,
    isExtendedFrench: false,
    boundary: polygon([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0]
    ]),
    ...over
  }) as SchoolBoundary

const schoolWith = (boundaries: SchoolBoundary[]): School =>
  ({ boundaries }) as unknown as School

describe('computeSchoolBboxes', () => {
  // The map splits catchment polygons by `boundary.isEnglish`; the bbox split must
  // use the same criterion. A regular French-language catchment (isEnglish=false,
  // not French Immersion / Extended French) must contribute to frenchBbox — and NOT
  // inflate englishBbox — or its marker carries no French bbox and a French-mode
  // click can neither fit nor select the polygon shown on hover.
  it('routes a regular French-language catchment to frenchBbox, not englishBbox', () => {
    const result = computeSchoolBboxes(
      schoolWith([
        boundary({
          isEnglish: true,
          boundary: polygon([
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0]
          ])
        }),
        boundary({
          isEnglish: false, // French-language catchment, not FI/Extended
          boundary: polygon([
            [10, 10],
            [12, 10],
            [12, 12],
            [10, 12],
            [10, 10]
          ])
        })
      ])
    )

    expect(result.englishBbox).toEqual({
      swLng: 0,
      neLng: 1,
      swLat: 0,
      neLat: 1
    })
    expect(result.frenchBbox).toEqual({
      swLng: 10,
      neLng: 12,
      swLat: 10,
      neLat: 12
    })
  })

  it('returns null for a language with no catchment boundary', () => {
    const result = computeSchoolBboxes(
      schoolWith([boundary({ isEnglish: true })])
    )
    expect(result.englishBbox).not.toBeNull()
    expect(result.frenchBbox).toBeNull()
  })

  it('excludes specialty-intake boundaries (non grade-level) from the bbox', () => {
    const result = computeSchoolBboxes(
      schoolWith([
        boundary({
          isEnglish: true,
          isElementary: false,
          isMiddle: false,
          isHigh: false, // not a grade-level catchment → regularBoundary === false
          boundary: polygon([
            [5, 5],
            [6, 5],
            [6, 6],
            [5, 6],
            [5, 5]
          ])
        })
      ])
    )
    expect(result.englishBbox).toBeNull()
    expect(result.frenchBbox).toBeNull()
  })

  // Real wire data marks specialty zones with grade flags SET (an AP boundary
  // still carries isHigh: true) and isEnglish: false — without the explicit
  // specialty exclusion such a board-wide zone lands in frenchBbox and the
  // school masquerades as a French catchment.
  it('excludes specialty-intake boundaries that carry grade flags', () => {
    const result = computeSchoolBboxes(
      schoolWith([
        boundary({
          isEnglish: false,
          isHigh: true,
          isAP: true,
          boundary: polygon([
            [5, 5],
            [6, 5],
            [6, 6],
            [5, 6],
            [5, 5]
          ])
        })
      ])
    )
    expect(result.englishBbox).toBeNull()
    expect(result.frenchBbox).toBeNull()
  })
})

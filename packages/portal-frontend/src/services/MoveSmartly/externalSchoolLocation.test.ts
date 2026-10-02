import {
  mergeSchoolBoundaries,
  parseSchoolRest,
  schoolFilterToken
} from './externalSchoolLocation'
import type { School, SchoolBoundary } from './types'

const boundary = (
  overrides: Partial<SchoolBoundary>,
  geometry: SchoolBoundary['boundary']
): SchoolBoundary =>
  ({
    gradeFrom: 0,
    gradeEnd: 8,
    isElementary: true,
    isMiddle: false,
    isHigh: false,
    isEnglish: true,
    isFrenchImmersion: false,
    isExtendedFrench: false,
    isAP: false,
    isIB: false,
    isGifted: false,
    isArts: false,
    isSport: false,
    boundary: geometry,
    ...overrides
  }) as SchoolBoundary

const ring: [number, number][] = [
  [-79.36, 43.67],
  [-79.35, 43.67],
  [-79.35, 43.68],
  [-79.36, 43.67]
]

describe('schoolFilterToken', () => {
  it('serializes options in fixed order', () => {
    expect(
      schoolFilterToken({
        elementary: true,
        secondary: true,
        public: true,
        catholic: true,
        french: false
      })
    ).toBe('e1s1p1c1f0')
  })

  it('treats missing keys as false', () => {
    expect(schoolFilterToken({})).toBe('e0s0p0c0f0')
  })
})

describe('parseSchoolRest', () => {
  it('round-trips id and french flag from the token', () => {
    expect(parseSchoolRest('208-e1s1p1c1f0')).toEqual({
      id: '208',
      french: false
    })
    expect(parseSchoolRest('208-e0s1p1c0f1')).toEqual({
      id: '208',
      french: true
    })
  })

  it('rejects malformed rests', () => {
    expect(parseSchoolRest('abc-e1s1p1c1f0')).toBeNull()
    expect(parseSchoolRest('208')).toBeNull()
    expect(parseSchoolRest('208-')).toBeNull()
  })
})

describe('mergeSchoolBoundaries', () => {
  const school: Pick<School, 'boundaries'> = {
    boundaries: [
      // English elementary Polygon — kept in English mode
      boundary({}, { type: 'Polygon', coordinates: [ring] }),
      // English high MultiPolygon — kept in English mode, flattened
      boundary(
        { isElementary: false, isHigh: true },
        { type: 'MultiPolygon', coordinates: [[ring], [ring]] }
      ),
      // French-side boundary — dropped in English mode
      boundary({ isEnglish: false }, { type: 'Polygon', coordinates: [ring] }),
      // Specialty zone (Arts) — never merged
      boundary(
        { isElementary: false, isMiddle: false, isHigh: false, isArts: true },
        { type: 'Polygon', coordinates: [ring] }
      ),
      // Missing geometry — skipped
      boundary({}, null)
    ]
  }

  it('merges regular boundaries of the active language into MultiPolygon coords', () => {
    expect(mergeSchoolBoundaries(school, false)).toHaveLength(3)
    expect(mergeSchoolBoundaries(school, true)).toHaveLength(1)
  })

  it('returns empty for a school without boundaries', () => {
    expect(mergeSchoolBoundaries({ boundaries: null }, false)).toEqual([])
  })
})

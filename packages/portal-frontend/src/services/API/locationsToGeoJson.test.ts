import { locationsToGeoJson } from './locationsToGeoJson'
import type { ApiLocation } from './types'

const ring = [
  [
    [-97.7, 30.2],
    [-97.6, 30.2],
    [-97.6, 30.3],
    [-97.7, 30.2]
  ]
]

const schoolWithBoundary: ApiLocation = {
  locationId: 'S1',
  name: 'Eastside Memorial',
  type: 'school',
  school: {
    schoolName: 'Eastside Memorial',
    districtName: 'Austin ISD',
    schoolType: 'public',
    schoolLevel: 'High',
    lowGrade: '09',
    highGrade: '12',
    metrics: { rankHistory: [], schoolYearlyDetails: [] }
  },
  // LiveBy returns coords as strings — cast to exercise Number() parsing.
  map: {
    latitude: '30.27' as unknown as number,
    longitude: '-97.70' as unknown as number,
    geometryType: 'MultiPolygon',
    boundary: [ring]
  }
}

const schoolNoBoundary: ApiLocation = {
  locationId: 'S2',
  name: 'No Boundary School',
  type: 'school',
  school: {
    schoolName: 'No Boundary School',
    districtName: null,
    schoolType: 'private',
    schoolLevel: 'Private',
    lowGrade: 'PK',
    highGrade: 'KG'
  },
  map: {
    latitude: '30.25' as unknown as number,
    longitude: '-97.72' as unknown as number
  }
}

const district: ApiLocation = {
  locationId: 'D1',
  name: 'Some District',
  type: 'district',
  map: { latitude: 30.2, longitude: -97.7, boundary: [ring] }
}

describe('locationsToGeoJson', () => {
  it('emits a polygon and a marker for a school with a boundary', () => {
    const fc = locationsToGeoJson([schoolWithBoundary], { markers: true })
    expect(fc.features).toHaveLength(2)
    const polygon = fc.features.find((f) => f.geometry.type === 'MultiPolygon')
    const point = fc.features.find((f) => f.geometry.type === 'Point')
    expect(polygon).toBeDefined()
    expect(point).toBeDefined()
    expect(point?.geometry).toEqual({
      type: 'Point',
      coordinates: [-97.7, 30.27]
    })
  })

  it('flattens school scalars and excludes metrics and map', () => {
    const fc = locationsToGeoJson([schoolWithBoundary], { markers: true })
    const props = fc.features[0].properties as Record<string, unknown>
    expect(props.schoolName).toBe('Eastside Memorial')
    expect(props.schoolLevel).toBe('High')
    expect(props.lowGrade).toBe('09')
    expect(props.locationId).toBe('S1')
    expect(props.metrics).toBeUndefined()
    expect(props.map).toBeUndefined()
  })

  it('emits only a marker for a school without a boundary', () => {
    const fc = locationsToGeoJson([schoolNoBoundary], { markers: true })
    expect(fc.features).toHaveLength(1)
    expect(fc.features[0].geometry.type).toBe('Point')
  })

  it('emits only a polygon for polygon-only types (no markers)', () => {
    const fc = locationsToGeoJson([district], { markers: false })
    expect(fc.features).toHaveLength(1)
    expect(fc.features[0].geometry.type).toBe('MultiPolygon')
  })

  it('skips features with non-finite coordinates', () => {
    const broken = {
      ...schoolNoBoundary,
      map: { latitude: NaN, longitude: NaN }
    }
    const fc = locationsToGeoJson([broken], { markers: true })
    expect(fc.features).toHaveLength(0)
  })
})

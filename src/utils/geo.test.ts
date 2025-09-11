import { getHeading, type Location } from './geo'

describe('utils/geo', () => {
  it('should calculate correct heading between two points', () => {
    const point1: Location = { lat: 37.7749, lng: -122.4194 } // San Francisco
    const point2: Location = { lat: 34.0522, lng: -118.2437 } // Los Angeles
    expect(getHeading(point1, point2)).toBeCloseTo(136)

    const point3: Location = { lat: 40.7128, lng: -74.006 } // New York
    const point4: Location = { lat: 34.0522, lng: -118.2437 } // Los Angeles
    expect(getHeading(point3, point4)).toBeCloseTo(273)
  })

  it('should calculate correct heading with headX adjustment', () => {
    const point1: Location = { lat: 37.7749, lng: -122.4194 } // San Francisco
    const point2: Location = { lat: 34.0522, lng: -118.2437 } // Los Angeles
    expect(getHeading(point1, point2, 10)).toBeCloseTo(126)
  })

  it('should return 0 when points are the same', () => {
    const point: Location = { lat: 37.7749, lng: -122.4194 }
    expect(getHeading(point, point)).toBe(0)
  })

  it('should return 0 when points have wrong format', () => {
    const point1: Location = {} as unknown as Location
    const point2: Location = { lat: 37.7749, lng: -122.4194 }
    expect(getHeading(point1, point2)).toBe(0)
    expect(getHeading(point2, point1)).toBe(0)
  })
})

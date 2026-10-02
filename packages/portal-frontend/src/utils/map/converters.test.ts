import type { LngLatBounds } from 'mapbox-gl'

import { boundsToCenterRadius } from './converters'

// Minimal structural stub — avoids importing the heavy mapbox-gl runtime in jest.
const fakeBounds = (
  center: { lng: number; lat: number },
  ne: { lng: number; lat: number }
) =>
  ({
    getCenter: () => center,
    getNorthEast: () => ne
  }) as unknown as LngLatBounds

describe('boundsToCenterRadius', () => {
  it('returns the center lat/long', () => {
    const { lat, long } = boundsToCenterRadius(
      fakeBounds({ lng: -97.7, lat: 30.2 }, { lng: -97.6, lat: 30.3 })
    )
    expect(lat).toBeCloseTo(30.2)
    expect(long).toBeCloseTo(-97.7)
  })

  it('returns the center-to-NE great-circle distance in kilometers', () => {
    const { radius } = boundsToCenterRadius(
      fakeBounds({ lng: 0, lat: 0 }, { lng: 1, lat: 1 })
    )
    expect(radius).toBeGreaterThan(150)
    expect(radius).toBeLessThan(160)
  })
})

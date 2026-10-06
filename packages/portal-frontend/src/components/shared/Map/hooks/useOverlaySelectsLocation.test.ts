import { locationFromProperties } from './useOverlaySelectsLocation'

describe('locationFromProperties', () => {
  it('reconstructs an ApiLocation without a boundary', () => {
    const location = locationFromProperties({
      locationId: 'sch-1',
      name: 'Lincoln High',
      type: 'school',
      longitude: -97.7,
      latitude: 30.2,
      address: { city: 'Austin' }
    })
    expect(location).toEqual({
      locationId: 'sch-1',
      name: 'Lincoln High',
      type: 'school',
      address: { city: 'Austin' },
      map: { latitude: 30.2, longitude: -97.7 }
    })
    expect(location?.map?.boundary).toBeUndefined()
  })

  it('omits map when coordinates are not finite', () => {
    const location = locationFromProperties({
      locationId: 'sch-2',
      name: 'No Coords',
      type: 'school'
    })
    expect(location?.map).toBeUndefined()
  })

  it('returns null when locationId or name is missing', () => {
    expect(locationFromProperties({ name: 'x' })).toBeNull()
    expect(locationFromProperties({ locationId: 'y' })).toBeNull()
  })

  it('sets bounds from a polygon bbox without exposing map.boundary', () => {
    const location = locationFromProperties({
      locationId: 'sch-3',
      name: 'Polygon School',
      type: 'school',
      longitude: -97.7,
      latitude: 30.2,
      bbox: [-97.8, 30.1, -97.6, 30.3]
    })
    expect(location?.bounds?.getWest()).toBe(-97.8)
    expect(location?.bounds?.getSouth()).toBe(30.1)
    expect(location?.bounds?.getEast()).toBe(-97.6)
    expect(location?.bounds?.getNorth()).toBe(30.3)
    // boundary stays absent so the listing query keeps filtering by locationId
    expect(location?.map?.boundary).toBeUndefined()
  })

  it('parses a serialized (stringified) bbox — the polygon-click case', () => {
    // Mapbox serializes array properties to JSON strings in click results, so a
    // polygon-click bbox arrives as a string; it must still yield bounds.
    const location = locationFromProperties({
      locationId: 'pc-1',
      name: '78758',
      type: 'postalCode',
      bbox: '[-97.8,30.1,-97.6,30.3]'
    })
    expect(location?.bounds?.getWest()).toBe(-97.8)
    expect(location?.bounds?.getNorth()).toBe(30.3)
  })

  it('ignores a malformed bbox', () => {
    const location = locationFromProperties({
      locationId: 'sch-4',
      name: 'Bad Bbox',
      type: 'school',
      bbox: [1, 2, 3]
    })
    expect(location?.bounds).toBeUndefined()
  })
})

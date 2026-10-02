import { resolvePolygonStyle } from './resolvePolygonStyle'

// The paint the listing page draws its single parcel with (configs/<tenant>/overlays).
const listingParcel = {
  'line-color': '#FFFFFF',
  'line-width': 2,
  'line-opacity': 1,
  'fill-opacity': 0
}

describe('resolvePolygonStyle', () => {
  it('keeps an override without a satellite variant identical in both map styles', () => {
    const plain = resolvePolygonStyle('static', { style: listingParcel })
    const dark = resolvePolygonStyle('static', {
      style: listingParcel,
      dark: true
    })

    expect(plain['line-color']).toBe('#FFFFFF')
    expect(dark['line-color']).toBe('#FFFFFF')
    expect(plain['line-width']).toBe(2)
    expect(dark['line-width']).toBe(2)
    expect(plain['line-opacity']).toBe(1)
    expect(dark['line-opacity']).toBe(1)
  })

  it('lets the override win over the overlay colour it would otherwise take', () => {
    const { 'line-color': line } = resolvePolygonStyle('static', {
      color: '#4C5774',
      satelliteColor: '#123456',
      dark: true,
      style: listingParcel
    })
    expect(line).toBe('#FFFFFF')
  })

  it('still applies the satellite variant when the override carries one', () => {
    const { 'line-color': line } = resolvePolygonStyle('static', {
      dark: true,
      style: { ...listingParcel, satellite: { 'line-color': '#000000' } }
    })
    expect(line).toBe('#000000')
  })
})

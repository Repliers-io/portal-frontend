import type { Map } from 'mapbox-gl'

import { styleReady } from './style'

const map = (state: {
  loaded: boolean
  removed?: boolean
  idle?: boolean
}): Map =>
  ({
    _removed: state.removed ?? false,
    style: { _loaded: state.loaded },
    isStyleLoaded: () => state.idle ?? false
  }) as unknown as Map

describe('styleReady', () => {
  // The trap: right after a pan the base tiles and a sibling GeoJSON `setData` are
  // still in flight, so `isStyleLoaded()` is false — yet `addLayer` is accepted.
  it('is ready while sources are still loading', () => {
    expect(styleReady(map({ loaded: true, idle: false }))).toBe(true)
  })

  it('is not ready before the stylesheet has loaded', () => {
    expect(styleReady(map({ loaded: false, idle: false }))).toBe(false)
  })

  it('is not ready on a removed map', () => {
    expect(styleReady(map({ loaded: true, removed: true }))).toBe(false)
  })
})

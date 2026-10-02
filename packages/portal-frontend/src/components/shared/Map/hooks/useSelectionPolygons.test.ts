import type { OverlayLayerDefinition } from '@defaults/map'

import type { ApiLocation } from 'services/API'

import { selectionToRender } from './useSelectionPolygons'

const overlays = [
  { id: 'livebySchool', selectable: 'marker', locationTypes: ['school'] }
] as unknown as OverlayLayerDefinition[]

const loc = (locationId: string, type: string, boundary = true) =>
  ({
    locationId,
    type,
    name: locationId,
    map: boundary ? { boundary: [[[[0, 0]]]] } : {}
  }) as unknown as ApiLocation

describe('selectionToRender', () => {
  it('includes a school when its overlay is inactive', () => {
    const out = selectionToRender([loc('s1', 'school')], new Set(), overlays)
    expect(out.map((l) => l.locationId)).toEqual(['s1'])
  })

  it('excludes a school when its overlay is active', () => {
    const out = selectionToRender(
      [loc('s1', 'school')],
      new Set(['livebySchool']),
      overlays
    )
    expect(out).toEqual([])
  })

  it('includes a city (no overlay) with a boundary', () => {
    const out = selectionToRender([loc('c1', 'city')], new Set(), overlays)
    expect(out.map((l) => l.locationId)).toEqual(['c1'])
  })

  it('excludes a location without a boundary', () => {
    const out = selectionToRender(
      [loc('c2', 'city', false)],
      new Set(),
      overlays
    )
    expect(out).toEqual([])
  })
})

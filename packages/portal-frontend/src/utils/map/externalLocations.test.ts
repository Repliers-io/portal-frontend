import { type ApiLocation } from 'services/API'

import {
  buildExternalLocationId,
  parseExternalLocationId,
  resolvableExternalIds,
  splitSelectionIds
} from './externalLocations'

const overlays = [
  { id: 'schools', external: {} },
  { id: 'condo-development', external: {} },
  { id: 'transit' } // no external support
]

describe('buildExternalLocationId', () => {
  it('joins overlay id and rest with a dash', () => {
    expect(buildExternalLocationId('schools', '208-e1s1p1c1f0')).toBe(
      'schools-208-e1s1p1c1f0'
    )
  })
})

describe('parseExternalLocationId', () => {
  it('parses a plain overlay id prefix', () => {
    expect(parseExternalLocationId('schools-208-e1s1p1c1f0', overlays)).toEqual(
      { overlayId: 'schools', rest: '208-e1s1p1c1f0' }
    )
  })

  it('matches the longest overlay id when ids contain dashes', () => {
    expect(
      parseExternalLocationId('condo-development-42-x1', overlays)
    ).toEqual({ overlayId: 'condo-development', rest: '42-x1' })
  })

  it('returns null for overlays without external support', () => {
    expect(parseExternalLocationId('transit-5-a', overlays)).toBeNull()
  })

  it('returns null for unknown prefixes and empty rest', () => {
    expect(parseExternalLocationId('CAONNBBYBDGOHE', overlays)).toBeNull()
    expect(parseExternalLocationId('schools-', overlays)).toBeNull()
    expect(parseExternalLocationId('schools', overlays)).toBeNull()
  })
})

describe('resolvableExternalIds', () => {
  it('keeps ids owned by a configured external overlay', () => {
    expect(
      resolvableExternalIds(
        ['schools-208-e1s1p1c1f0', 'condo-development-42-x1'],
        overlays
      )
    ).toEqual(['schools-208-e1s1p1c1f0', 'condo-development-42-x1'])
  })

  it('drops ids whose overlay is not configured for this tenant', () => {
    // `schools` overlay absent (a non-movesmartly tenant) — the id can never
    // resolve, so it must not survive into the externalLocationId filter.
    expect(
      resolvableExternalIds(['schools-208-e1s1p1c1f0'], [{ id: 'transit' }])
    ).toEqual([])
    expect(resolvableExternalIds(['transit-5-a'], overlays)).toEqual([])
    expect(resolvableExternalIds([], overlays)).toEqual([])
  })
})

describe('splitSelectionIds', () => {
  const native = { locationId: 'CAONNBBYBDGOHE', name: 'North Riverdale' }
  const external = {
    locationId: 'schools-208-e1s1p1c1f0',
    name: 'Withrow Avenue Public School',
    external: true
  }

  it('splits by the external flag preserving order', () => {
    expect(splitSelectionIds([native, external] as ApiLocation[])).toEqual({
      locationId: ['CAONNBBYBDGOHE'],
      externalLocationId: ['schools-208-e1s1p1c1f0']
    })
  })

  it('returns empty arrays for an empty selection', () => {
    expect(splitSelectionIds([])).toEqual({
      locationId: [],
      externalLocationId: []
    })
  })
})

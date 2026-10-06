import type { OverlayLayerDefinition } from '@defaults/map'

import type { ApiLocation } from 'services/API'

import { staleExternalSelections } from './useExternalSelectionReset'

const token = (options: Record<string, boolean>) =>
  `e${options.elementary ? 1 : 0}f${options.french ? 1 : 0}`

const schools = {
  id: 'schools',
  label: 'Schools',
  locationTypes: ['school'],
  filterOptions: [
    { key: 'elementary', label: 'Elementary', defaultValue: true },
    { key: 'french', label: 'French', defaultValue: false }
  ],
  external: { resolveLocation: async () => null, filterToken: token },
  fetchData: async () => ({ type: 'FeatureCollection' as const, features: [] })
} as unknown as OverlayLayerDefinition

const selected = (id: string): ApiLocation =>
  ({ locationId: id, name: id, type: 'school', external: true }) as ApiLocation

describe('staleExternalSelections', () => {
  it('drops a selection whose token drifted from the active layer options', () => {
    const stale = staleExternalSelections(
      [selected('schools-208-e1f0')],
      [schools],
      new Set(['schools']),
      { schools: { french: true } } // effective token becomes e1f1
    )
    expect(stale.map((l) => l.locationId)).toEqual(['schools-208-e1f0'])
  })

  it('keeps selections matching the effective (default) options', () => {
    expect(
      staleExternalSelections(
        [selected('schools-208-e1f0')],
        [schools],
        new Set(['schools']),
        {}
      )
    ).toEqual([])
  })

  it('ignores selections while their layer is inactive', () => {
    expect(
      staleExternalSelections(
        [selected('schools-208-e1f1')],
        [schools],
        new Set<string>(),
        {}
      )
    ).toEqual([])
  })

  it('ignores native locations', () => {
    const native = {
      locationId: 'CAONNBBYBDGOHE',
      name: 'North Riverdale',
      type: 'neighborhood'
    } as ApiLocation
    expect(
      staleExternalSelections([native], [schools], new Set(['schools']), {})
    ).toEqual([])
  })
})

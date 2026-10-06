import type { ApiLocation } from 'services/API'

import { toggleLocationInList } from './useLocationSelection'

const loc = (locationId: string): ApiLocation => ({
  locationId,
  name: `Name ${locationId}`,
  type: 'school'
})

describe('toggleLocationInList', () => {
  it('adds a location when its id is absent', () => {
    const result = toggleLocationInList([loc('a')], loc('b'))
    expect(result.map((l) => l.locationId)).toEqual(['a', 'b'])
  })

  it('removes a location when its id is present', () => {
    const result = toggleLocationInList([loc('a'), loc('b')], loc('a'))
    expect(result.map((l) => l.locationId)).toEqual(['b'])
  })

  it('treats null as an empty list', () => {
    const result = toggleLocationInList(null, loc('a'))
    expect(result.map((l) => l.locationId)).toEqual(['a'])
  })

  it('does not clear other types (independent selection)', () => {
    const city: ApiLocation = { locationId: 'c', name: 'City', type: 'city' }
    const result = toggleLocationInList([city], loc('s'))
    expect(result.map((l) => l.locationId)).toEqual(['c', 's'])
  })
})

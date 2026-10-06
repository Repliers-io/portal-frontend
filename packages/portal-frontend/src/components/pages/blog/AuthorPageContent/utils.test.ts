import { buildAgentSoldQueries } from './utils'

describe('buildAgentSoldQueries', () => {
  it('builds list-side and buy-side branches on both Key and MlsId fields', () => {
    expect(buildAgentSoldQueries('NWM130715')).toEqual([
      { 'raw.ListAgentMlsId': 'NWM130715' },
      { 'raw.BuyerAgentMlsId': 'NWM130715' },
      { 'raw.ListAgentKey': 'NWM130715' },
      { 'raw.BuyerAgentKey': 'NWM130715' }
    ])
  })

  it('coerces a numeric id to string', () => {
    expect(buildAgentSoldQueries(12345)).toEqual([
      { 'raw.ListAgentMlsId': '12345' },
      { 'raw.BuyerAgentMlsId': '12345' },
      { 'raw.ListAgentKey': '12345' },
      { 'raw.BuyerAgentKey': '12345' }
    ])
  })

  it('returns undefined for a missing id', () => {
    expect(buildAgentSoldQueries(undefined)).toBeUndefined()
  })

  it('returns undefined for a malformed id', () => {
    expect(buildAgentSoldQueries('bad/id')).toBeUndefined()
  })
})

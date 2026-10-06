import estimateConfig from '@configs/estimate'

const { defaultBrokerageName } = estimateConfig

import type {
  ApiAgentsCreateParams,
  ApiRplAgent,
  FubUserDiff
} from 'services/API'

import diffAgent from './diffAgent'

describe('diffAgent', () => {
  it('should return an empty array if there are no differences', () => {
    const agentMappedFields: ApiAgentsCreateParams = {
      externalId: '1',
      fname: 'John',
      lname: 'Dow',
      phone: '',
      email: 'john@email.com',
      brokerage: defaultBrokerageName,
      designation: 'Broker',
      status: true
    }

    const agent: ApiRplAgent = {
      externalId: '1',
      fname: 'John',
      lname: 'Dow',
      phone: '155587654321',
      email: 'john@email.com',
      brokerage: defaultBrokerageName,
      designation: 'Broker',
      status: true,
      // this fields will be ignored
      agentId: 12345,
      proxyPhone: '155512345678',
      proxyEmail: 'proxy@email.com',
      avatar: null,
      data: {
        syncDate: '2025-04-29T14:11:30.420Z'
      }
    }

    // comparing only by fields that exist in both objects and values not falsy
    const result = diffAgent(agentMappedFields, agent)
    expect(result).toEqual<FubUserDiff[]>([])
  })

  it('should return differences if fields differ', () => {
    const agentMappedFields = { fname: 'Terence' } as ApiAgentsCreateParams
    const agent: ApiRplAgent = { fname: '_Terence_' } as ApiRplAgent

    const result = diffAgent(agentMappedFields, agent)
    expect(result).toEqual<FubUserDiff[]>([
      { prop: 'fname', from: '_Terence_', to: 'Terence' }
    ])
  })

  it('should exclude falsy values from the diff', () => {
    const agentMappedFields = { phone: '' } as ApiAgentsCreateParams
    const agent: ApiRplAgent = { phone: '14036506311' } as ApiRplAgent

    const result = diffAgent(agentMappedFields, agent)
    expect(result).toEqual<FubUserDiff[]>([])
  })

  // NOTE: TODO: WARN: ERROR: temporary disabled test, while we're looking for a solution with libphonenumber-js metadata
  // it('should handle multiple differences', () => {
  //   const agentMappedFields = {
  //     fname: 'Jackie',
  //     lname: 'Chan',
  //     phone: '14036506311'
  //   } as ApiAgentsCreateParams

  //   const agent = {
  //     fname: 'Spider',
  //     lname: 'Man',
  //     phone: '9379992'
  //   } as ApiRplAgent

  //   const result = diffAgent(agentMappedFields, agent)
  //   expect(result).toEqual<FubUserDiff[]>([
  //     { prop: 'fname', from: 'Spider', to: 'Jackie' },
  //     { prop: 'lname', from: 'Man', to: 'Chan' },
  //     { prop: 'phone', from: '9379992', to: '14036506311' }
  //   ])
  // })
})

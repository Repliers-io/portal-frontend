import type {
  ApiAgentsCreateParams,
  ApiRplAgent,
  FubUserDiff
} from 'services/API'

import diffAgent from './diffAgent'

describe('diffAgent', () => {
  it('should return an empty array if there are no differences', () => {
    const agentMappedFields: ApiAgentsCreateParams = {
      externalId: '11',
      fname: 'Terence',
      lname: 'Law',
      phone: '',
      email: 'terence@justinhavre.com',
      brokerage: 'Justin Havre Real Estate Team eXp Realty',
      designation: 'Broker',
      status: true
    }

    const agent: ApiRplAgent = {
      externalId: '11',
      fname: 'Terence',
      lname: 'Law',
      phone: '14036506311',
      email: 'terence@justinhavre.com',
      brokerage: 'Justin Havre Real Estate Team eXp Realty',
      designation: 'Broker',
      status: true,
      // this fields will be ignored
      agentId: 106685,
      proxyPhone: '15873179104',
      proxyEmail: '4dwhoj5k4ma2trmjp@mail.dev-justinhavre-avm.condosportal.ca',
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

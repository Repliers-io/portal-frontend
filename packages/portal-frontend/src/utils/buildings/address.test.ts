import { type ApiBuilding } from 'services/API'

import { buildingAddressFilter } from './address'

describe('buildingAddressFilter', () => {
  it('drops a street direction folded into the house number', () => {
    const building = {
      address: {
        streetNumber: '10700 NE',
        streetName: '4th',
        city: 'Bellevue',
        neighborhood: 'Downtown'
      }
    } as ApiBuilding

    expect(buildingAddressFilter(building)).toEqual({
      streetNumber: '10700',
      streetName: '4th',
      city: 'Bellevue',
      neighborhood: 'Downtown'
    })
  })
})

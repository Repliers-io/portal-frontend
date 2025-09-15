import propsConfig from '@configs/properties'

import { type Property, type PropertyDetails } from 'services/API'

import {
  active,
  getBedrooms,
  getImageName,
  getStatusLabel,
  getUniqueKey,
  premium,
  restricted,
  sold
} from '.'

const { premiumCondoPrice, premiumResidentialPrice } = propsConfig

describe('utils/properties', () => {
  const condoProperty = {
    class: 'CondoProperty',
    listPrice: premiumCondoPrice + 1,
    status: 'A',
    permissions: {
      displayPublic: 'Y'
    }
  } as unknown as Property

  const residentialProperty = {
    class: 'ResidentialProperty',
    listPrice: premiumResidentialPrice + 1,
    lastStatus: 'New',
    permissions: {
      displayPublic: 'Y'
    }
  } as unknown as Property

  const sold1Property = {
    lastStatus: 'Sld',
    permissions: {
      displayPublic: 'N'
    }
  } as unknown as Property

  const sold2Property = {
    class: 'ResidentialProperty',
    listPrice: premiumResidentialPrice + 1,
    status: 'U',
    permissions: {
      displayPublic: 'N'
    }
  } as unknown as Property

  const activeRestrictedProperty = {
    class: 'CondoProperty',
    status: 'A',
    permissions: {
      displayPublic: 'N'
    }
  } as unknown as Property

  it('should correctly identify a Premium property', () => {
    expect(premium(condoProperty)).toBe(true)
    expect(premium(residentialProperty)).toBe(true)

    expect(
      premium({ ...condoProperty, listPrice: `${premiumCondoPrice - 1}` })
    ).toBe(false)
    expect(
      premium({
        ...residentialProperty,
        listPrice: `${premiumResidentialPrice - 1}`
      })
    ).toBe(false)
  })

  it('should correctly identify an Active property', () => {
    expect(active(condoProperty)).toBe(true)
    expect(active(residentialProperty)).toBe(true)
    expect(active(sold1Property)).toBe(false)
    expect(active(sold2Property)).toBe(false)
  })

  it('should correctly identify a Sold property', () => {
    expect(sold(condoProperty)).toBe(false)
    expect(sold(residentialProperty)).toBe(false)
    expect(sold(sold1Property)).toBe(true)
    expect(sold(sold2Property)).toBe(true)
  })

  it('should correctly identify Restricted property', () => {
    expect(restricted(condoProperty)).toBe(false)
    expect(restricted(residentialProperty)).toBe(false)
    expect(restricted(sold1Property)).toBe(true)
    expect(restricted(sold2Property)).toBe(true)
    expect(restricted(activeRestrictedProperty)).toBe(true)
  })

  it('should correctly get the status label of a property', () => {
    expect(getStatusLabel(condoProperty)).toBe('Active')
    expect(getStatusLabel(residentialProperty)).toBe('Active')
    expect(getStatusLabel(sold1Property)).toBe('Sold')
    expect(getStatusLabel(sold2Property)).toBe('Sold')
    expect(getStatusLabel(activeRestrictedProperty)).toBe('Restricted')
  })

  it('should correctly get the number of bedrooms', () => {
    const details1 = {} as PropertyDetails
    expect(getBedrooms(details1).count).toBe(0)
    expect(getBedrooms(details1).label).toBe('')

    const details2 = {
      numBedrooms: '3',
      numBedroomsPlus: '1'
    } as unknown as PropertyDetails

    expect(getBedrooms(details2).count).toBe(4)
    expect(getBedrooms(details2).label).toBe('3+1')

    const details3 = {
      numBedrooms: '5',
      numBedroomsPlus: '0'
    } as unknown as PropertyDetails

    expect(getBedrooms(details3).count).toBe(5)
    expect(getBedrooms(details3).label).toBe('5')

    const details4 = {
      numBedrooms: '0',
      numBedroomsPlus: '1'
    } as unknown as PropertyDetails

    expect(getBedrooms(details4).count).toBe(1)
    expect(getBedrooms(details4).label).toBe('1')
  })

  it('should correctly extract image name', () => {
    expect(getImageName('test/smartmls/IMG-24014095_31.jpg')).toBe(
      '24014095_31'
    )
    expect(getImageName('IMG-24014095_31.jpg')).toBe('24014095_31')
    expect(getImageName('IMG-24014095_31')).toBe('24014095_31')
    expect(getImageName('test/smartmls/BG-24014095_31.jpg')).toBe(
      'BG-24014095_31'
    )
  })

  it('should correctly construct Unique Key', () => {
    const uProperty1 = {
      mlsNumber: '12347',
      boardId: 1,
      images: []
    } as unknown as Property

    const uProperty2 = {
      mlsNumber: '12347',
      startImage: 2
    } as unknown as Property

    const uProperty3 = {
      mlsNumber: '12347',
      startImage: 3
    } as unknown as Property

    expect(getUniqueKey(uProperty1)).toBe('12347-1-0')
    expect(getUniqueKey(uProperty2)).toBe('12347-0-2')
    expect(getUniqueKey(uProperty3)).toBe('12347-0-3')
  })
})

import listingsConfig from '@configs/listings'

import { type ApiListing, type ApiListingDetails } from 'services/API'

import {
  active,
  getBedrooms,
  getImageName,
  getStatusLabel,
  getUniqueKey,
  land,
  premium,
  restricted,
  sold,
  upcomingOpenHouses
} from '.'

const { premiumCondo, premiumResidential } = listingsConfig.pricing

describe('utils/listings', () => {
  const condoProperty = {
    class: 'CondoProperty',
    listPrice: premiumCondo + 1,
    status: 'A',
    permissions: {
      displayPublic: 'Y'
    }
  } as unknown as ApiListing

  const residentialProperty = {
    class: 'ResidentialProperty',
    listPrice: premiumResidential + 1,
    lastStatus: 'New',
    permissions: {
      displayPublic: 'Y'
    }
  } as unknown as ApiListing

  const sold1Property = {
    lastStatus: 'Sld',
    permissions: {
      displayPublic: 'N'
    }
  } as unknown as ApiListing

  const sold2Property = {
    class: 'ResidentialProperty',
    listPrice: premiumResidential + 1,
    status: 'U',
    permissions: {
      displayPublic: 'N'
    }
  } as unknown as ApiListing

  const activeRestrictedProperty = {
    class: 'CondoProperty',
    status: 'A',
    permissions: {
      displayPublic: 'N'
    }
  } as unknown as ApiListing

  const lceProperty = {
    lastStatus: 'Lce'
  } as unknown as ApiListing

  it('should correctly identify a Premium property', () => {
    expect(premium(condoProperty)).toBe(true)
    expect(premium(residentialProperty)).toBe(true)

    expect(
      premium({ ...condoProperty, listPrice: `${premiumCondo - 1}` })
    ).toBe(false)
    expect(
      premium({
        ...residentialProperty,
        listPrice: `${premiumResidential - 1}`
      })
    ).toBe(false)
  })

  it('should correctly identify an Active property', () => {
    expect(active(condoProperty)).toBe(true)
    expect(active(residentialProperty)).toBe(true)
    expect(active(sold1Property)).toBe(false)
    expect(active(sold2Property)).toBe(false)
    expect(active(lceProperty)).toBe(true)
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

  it('should classify the property type as a strict boolean', () => {
    // a numeric result leaks through JSX guards like
    // `{lotSize.number > 0 && land(listing) && …}` and React renders a bare 0
    const landProperty = {
      details: { propertyType: 'Land' }
    } as unknown as ApiListing

    expect(land(landProperty)).toBe(true)
    expect(land(residentialProperty)).toBe(false)
  })

  it('should correctly get the number of bedrooms', () => {
    const details1 = {} as ApiListingDetails
    expect(getBedrooms(details1).count).toBe(0)
    expect(getBedrooms(details1).label).toBe('')

    const details2 = {
      numBedrooms: '3',
      numBedroomsPlus: '1'
    } as unknown as ApiListingDetails

    expect(getBedrooms(details2).count).toBe(4)
    expect(getBedrooms(details2).label).toBe('3+1')

    const details3 = {
      numBedrooms: '5',
      numBedroomsPlus: '0'
    } as unknown as ApiListingDetails

    expect(getBedrooms(details3).count).toBe(5)
    expect(getBedrooms(details3).label).toBe('5')

    const details4 = {
      numBedrooms: '0',
      numBedroomsPlus: '1'
    } as unknown as ApiListingDetails

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
    } as unknown as ApiListing

    const uProperty2 = {
      mlsNumber: '12347',
      matchedImage: 'IMG-12347_2.jpg'
    } as unknown as ApiListing

    const uProperty3 = {
      mlsNumber: '12347',
      matchedImage: 'IMG-12347_c4385940-4a8f-41c0-b683-b69bd6a8687a-l.jpg'
    } as unknown as ApiListing

    expect(getUniqueKey(uProperty1)).toBe('12347-1-')
    expect(getUniqueKey(uProperty2)).toBe('12347-0-12347_2')
    expect(getUniqueKey(uProperty3)).toBe(
      '12347-0-12347_c4385940-4a8f-41c0-b683-b69bd6a8687a-l'
    )
  })
})

describe('upcomingOpenHouses', () => {
  it('should return upcoming open houses sorted by date', () => {
    const listing = {
      openHouse: {
        1: { date: '2099-06-01', startTime: '2:00 PM', endTime: '4:00 PM' },
        2: { date: '2099-06-03', startTime: '10:00 AM', endTime: '12:00 PM' },
        3: { date: '2020-01-01', startTime: '12:00 PM', endTime: '2:00 PM' }
      }
    } as unknown as ApiListing

    const result = upcomingOpenHouses(listing)
    expect(result[0].date).toBe('2099-06-01')
    expect(result[0].startTime).toBe('2:00 PM')
    expect(result).toHaveLength(2)
  })

  it('should return empty array when all are in the past or missing', () => {
    const past = {
      openHouse: {
        1: { date: '2020-01-01', startTime: '12:00 PM', endTime: '2:00 PM' }
      }
    } as unknown as ApiListing
    expect(upcomingOpenHouses(past)).toHaveLength(0)
    expect(
      upcomingOpenHouses({ openHouse: {} } as unknown as ApiListing)
    ).toHaveLength(0)
    expect(upcomingOpenHouses({} as unknown as ApiListing)).toHaveLength(0)
  })
})

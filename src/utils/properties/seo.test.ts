import searchConfig from '@configs/search'

import {
  property1,
  property2,
  property3,
  property4,
  property5
} from './__mocks__'
import { getSeoUrl, parseSeoUrl } from './seo'

describe('utils/properties/seo', () => {
  it('should correctly format addresses to SEO url', () => {
    expect(getSeoUrl(property1)).toBe(
      '/listing/ph3-135-lower-barrette-way-east-ottawa-k1l-7z9-12345-12'
    )
    expect(getSeoUrl(property2)).toBe(
      '/listing/135-lower-barrette-way-ottawa-k1l-7z9-12346-13'
    )
  })

  it('should correctly format adresses with additional image param', () => {
    expect(getSeoUrl(property2, { startImage: 12 })).toBe(
      '/listing/135-lower-barrette-way-ottawa-k1l-7z9-12346-13?startImage=12'
    )
  })

  it('should correctly format adresses with missing boardId or boardId passed in arguments to SEO url', () => {
    expect(getSeoUrl(property3, { boardId: 14 })).toBe(
      '/listing/13-5-d-artagnan-bay-ottawa-12346-14?startImage=1'
    )
    expect(getSeoUrl(property4, { boardId: 15 })).toBe('/listing/12347-15')
  })

  it('should correctly format adresses with scrabbed fields and missing boardId to SEO url', () => {
    expect(getSeoUrl(property5)).toBe('/listing/o-reilly-12346')
  })

  it('should correctly parse SEO url to address', () => {
    expect(
      parseSeoUrl('ph3-135-lower-barrette-way-east-ottawa-k1l-7z9-X12345X-12')
    ).toMatchObject({
      unitNumber: 'PH3',
      streetName: 'Lower Barrette Way',
      streetSuffix: 'east',
      city: 'Ottawa',
      zip: 'K1L 7Z9',
      mlsNumber: 'X12345X',
      boardId: 12
    })

    expect(
      parseSeoUrl('135-lower-barrette-way-ottawa-k1l-7z9-12346')
    ).toMatchObject({
      streetName: 'Lower Barrette',
      streetSuffix: 'way',
      streetNumber: '135',
      city: 'Ottawa',
      zip: 'K1L 7Z9',
      mlsNumber: '12346',
      boardId: searchConfig.defaultBoardId
    })

    expect(parseSeoUrl('X12346X')).toMatchObject({
      mlsNumber: 'X12346X',
      boardId: searchConfig.defaultBoardId
    })
  })

  it('should correctly parse SEO url with US zip code', () => {
    expect(
      parseSeoUrl('12-elm-street-chicago-60090-X12345X-999')
    ).toMatchObject({
      streetNumber: '12',
      streetName: 'Elm',
      streetSuffix: 'street',
      city: 'Chicago',
      zip: '60090',
      mlsNumber: 'X12345X',
      boardId: 999
    })
  })

  // expect(parseSeoUrl('12346-123')).toMatchObject({
  //   mlsNumber: '12346',
  //   boardId: 123
  // })
})

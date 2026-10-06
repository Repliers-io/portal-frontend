import searchConfig from '@configs/search'

import { type ApiListing } from 'services/API'

import {
  property1,
  property2,
  property3,
  property4,
  property5
} from './__mocks__'
import {
  getCompactSeoTitle,
  getSeoUrl,
  parseSeoUrl,
  resolveBoardId
} from './seo'

let mockDistinctBoardIds = [15]

// Board 15 stands in for a board the tenant addresses by its own id, so the
// board-suffix behavior is exercised (the defaults tenant ships an empty
// distinctBoardIds). A getter, because `resolveBoardId` and `getSeoUrl` read the
// list per call — that is what lets a test widen it.
jest.mock('@configs/search', () => {
  const actual = jest.requireActual('@configs/search').default
  return {
    __esModule: true,
    default: {
      ...actual,
      get distinctBoardIds() {
        return mockDistinctBoardIds
      }
    }
  }
})

describe('utils/listings/seo', () => {
  it('should correctly format addresses to SEO url', () => {
    expect(getSeoUrl(property1)).toBe(
      '/listing/ph3-135-lower-barrette-way-east-ottawa-k1l-7z9-12345'
    )
    expect(getSeoUrl(property2)).toBe(
      '/listing/135-lower-barrette-way-ottawa-k1l-7z9-12346'
    )
  })

  it('names the photo in the image param, url-encoded', () => {
    expect(
      getSeoUrl(property2, {
        image: 'IMG-12346_c4385940-4a8f-41c0-b683-b69bd6a8687a-l.jpg'
      })
    ).toBe(
      '/listing/135-lower-barrette-way-ottawa-k1l-7z9-12346?image=IMG-12346_c4385940-4a8f-41c0-b683-b69bd6a8687a-l.jpg'
    )
  })

  it('stays board-less for listings on a non-distinct board', () => {
    expect(getSeoUrl(property3)).toBe(
      '/listing/13-5-d-artagnan-bay-ottawa-12346?image=IMG-12346_1.jpg'
    )
    // property4 carries boardId '14', which is not in distinctBoardIds → no suffix
    expect(getSeoUrl(property4)).toBe('/listing/12347')
  })

  it('appends the board suffix for listings on a distinct-namespace board', () => {
    expect(getSeoUrl({ ...property4, boardId: 15 })).toBe('/listing/12347-15')
    expect(getSeoUrl({ ...property3, boardId: 15 })).toBe(
      '/listing/13-5-d-artagnan-bay-ottawa-12346-15?image=IMG-12346_1.jpg'
    )
  })

  describe('resolveBoardId', () => {
    it('returns the listing board for a distinct-namespace board', () => {
      expect(resolveBoardId({ boardId: 15 } as ApiListing)).toBe(15)
    })

    it('coerces a numeric-string boardId before matching', () => {
      expect(resolveBoardId({ boardId: '15' } as unknown as ApiListing)).toBe(
        15
      )
    })

    it('falls back to the default read board for a non-distinct board', () => {
      expect(resolveBoardId({ boardId: 14 } as ApiListing)).toBe(
        searchConfig.defaultBoardId
      )
    })

    it('falls back to the default read board when boardId is missing', () => {
      expect(resolveBoardId({} as ApiListing)).toBe(searchConfig.defaultBoardId)
    })

    describe('when every board is addressed explicitly', () => {
      beforeEach(() => {
        mockDistinctBoardIds = [15, 14, searchConfig.defaultBoardId]
      })

      afterEach(() => {
        mockDistinctBoardIds = [15]
      })

      it('keeps the board a listing was found on', () => {
        expect(resolveBoardId({ boardId: 14 } as ApiListing)).toBe(14)
        expect(resolveBoardId({ boardId: 15 } as ApiListing)).toBe(15)
      })

      it('still falls back to the default read board when boardId is missing', () => {
        expect(resolveBoardId({} as ApiListing)).toBe(
          searchConfig.defaultBoardId
        )
      })

      it('carries the board into the listing url so a direct visit reads the same record', () => {
        expect(getSeoUrl({ ...property4, boardId: 14 })).toBe(
          '/listing/12347-14'
        )
      })

      it('spells out the default board too, instead of hiding one board of several', () => {
        expect(
          getSeoUrl({ ...property4, boardId: searchConfig.defaultBoardId })
        ).toBe(`/listing/12347-${searchConfig.defaultBoardId}`)
      })
    })
  })

  it('should correctly format adresses with scrabbed fields and missing boardId to SEO url', () => {
    expect(getSeoUrl(property5)).toBe('/listing/o-reilly-12346')
  })

  it('should build the compact SEO title (address, city, state zip | MLS#)', () => {
    expect(
      getCompactSeoTitle({
        address: {
          unitNumber: 'B',
          streetNumber: '3816',
          streetName: 'EVANSTON',
          streetSuffix: 'Avenue',
          streetDirection: 'N',
          city: 'SEATTLE',
          state: 'WA',
          zip: '98103'
        },
        mlsNumber: '2546317'
      } as unknown as ApiListing)
    ).toBe('3816 B Evanston Avenue N, Seattle, WA 98103 | MLS# 2546317')
  })

  it('should omit the MLS segment from the compact title when mlsNumber is empty', () => {
    expect(
      getCompactSeoTitle({
        address: {
          streetNumber: '135',
          streetName: 'LOWER BARRETTE',
          streetSuffix: 'Way',
          city: 'Ottawa',
          state: 'ON',
          zip: 'K1L 7Z9'
        },
        mlsNumber: ''
      } as unknown as ApiListing)
    ).toBe('135 Lower Barrette Way, Ottawa, ON K1L 7Z9')
  })

  it('should correctly parse SEO url to address', () => {
    expect(
      parseSeoUrl('ph3-135-lower-barrette-way-east-ottawa-k1l-7z9-X12345X')
    ).toMatchObject({
      unitNumber: 'PH3',
      streetName: 'Lower Barrette Way',
      streetSuffix: 'east',
      city: 'Ottawa',
      zip: 'K1L 7Z9',
      mlsNumber: 'X12345X',
      boardId: searchConfig.defaultBoardId
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
    expect(parseSeoUrl('12-elm-street-chicago-60090-X12345X')).toMatchObject({
      streetNumber: '12',
      streetName: 'Elm',
      streetSuffix: 'street',
      city: 'Chicago',
      zip: '60090',
      mlsNumber: 'X12345X',
      boardId: searchConfig.defaultBoardId
    })
  })
})

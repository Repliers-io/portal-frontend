import { type ApiListing } from 'services/API'

import {
  pagesInResponse,
  sliceListingsPerPage,
  toServerPage,
  updatePageParam
} from './pagination'

const pageSize = 24

describe('utils/pagination', () => {
  const listingsMock = Array.from({ length: 80 }).map(
    (item, index) =>
      ({
        boardId: index
      }) as ApiListing
  )

  it('should have correct number of items based on clientPage value and project constants', () => {
    expect(sliceListingsPerPage(listingsMock, 0)).toHaveLength(0)
    expect(sliceListingsPerPage(listingsMock, 1)).toHaveLength(pageSize)
    expect(sliceListingsPerPage(listingsMock, 2)).toHaveLength(24)
  })

  // not really useful test, more of a proof of concept
  it('should start slicing properties from the beginning of the array if the frame size was exceeded', () => {
    const result = sliceListingsPerPage(listingsMock, 1)
    const result2 = sliceListingsPerPage(listingsMock, pagesInResponse + 1)
    expect(result[0]).toEqual(result2[0])
  })

  it('should update the URL with the correct page number', () => {
    window.location.search = ''
    expect(updatePageParam(1)).toBe('') // page=1 should not be added
    expect(updatePageParam(2)).toBe('?page=2')

    window.location.search = '?test=1'
    expect(updatePageParam(1)).toBe('?test=1') // page=1 should not be added
    expect(updatePageParam(2)).toBe('?test=1&page=2')

    window.location.search = '?page=3&test=1'
    expect(updatePageParam(1)).toBe('?test=1') // previous page value should be removed
    expect(updatePageParam(2)).toBe('?page=2&test=1') // new value should be placed at the same position

    window.location.search = '?q=QUERY&page=3&test=1'
    expect(updatePageParam(1)).toBe('?q=QUERY&test=1') // previous page value should be removed
    expect(updatePageParam(2)).toBe('?q=QUERY&page=2&test=1') // new value should be placed at the same position
  })

  it('should convert client page to server page', () => {
    expect(toServerPage(1)).toBe(1)
    expect(toServerPage(2)).toBe(1)
    expect(toServerPage(5)).toBe(2)
    expect(toServerPage(9)).toBe(3)
  })

  it('should throw an error for clientPage less than 1', () => {
    expect(() => toServerPage(0)).toThrow(Error)
  })
})

import { APISearch } from 'services/API'

import SearchService from './Search'

jest.mock('services/API', () => ({
  APISearch: { fetch: jest.fn() }
}))

const fetchMock = APISearch.fetch as jest.Mock

const firstRequest = () =>
  fetchMock.mock.calls[0][0] as {
    get: Record<string, unknown>
    post: Record<string, unknown>
  }

describe('SearchService.fetchListings', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({ listings: [] })
  })

  it('applies the default map rectangle and active-status filter by default', async () => {
    await SearchService.fetchListings({}, true)

    const { get, post } = firstRequest()
    expect(post.map).toBeDefined()
    expect(get.status).toBeDefined()
  })

  it('drops the rectangle and queries both statuses for an mlsNumber list', async () => {
    await SearchService.fetchListings({ mlsNumber: ['W1', 'W2'] }, true)

    const { get, post } = firstRequest()
    expect(post.map).toBeUndefined()
    // API defaults to active-only without a status, so both are pinned to keep
    // sold/off-market listings from the requested set visible.
    expect(get.status).toEqual(['A', 'U'])
    expect(get.mlsNumber).toEqual(['W1', 'W2'])
  })

  it('drops the defaults for a single mlsNumber string too', async () => {
    await SearchService.fetchListings({ mlsNumber: 'W1' }, true)

    const { get, post } = firstRequest()
    expect(post.map).toBeUndefined()
    expect(get.mlsNumber).toBe('W1')
  })

  it('drops the default rectangle for a radius search but keeps status defaults', async () => {
    await SearchService.fetchListings(
      { lat: '30.2672', long: '-97.7431', radius: 5 },
      true
    )

    const { get, post } = firstRequest()
    // radius carries its own geo-area; the default rectangle must not clip it
    expect(post.map).toBeUndefined()
    expect(get.radius).toBe(5)
    expect(get.status).toBeDefined()
  })

  it('keeps the defaults when mlsNumber is an empty list', async () => {
    await SearchService.fetchListings({ mlsNumber: [] }, true)

    const { get, post } = firstRequest()
    expect(post.map).toBeDefined()
    expect(get.status).toBeDefined()
  })
})

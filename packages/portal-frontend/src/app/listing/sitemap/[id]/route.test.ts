/** @jest-environment node */
import listingsConfig from '@configs/listings'

import { APISearch } from 'services/API'

import { generateStaticParams, GET } from './route'

jest.mock('@configs/features', () => ({
  __esModule: true,
  default: { ...jest.requireActual('@configs/features').default, map: true }
}))

const request = {} as Request

describe('listing sitemap route', () => {
  afterEach(() => jest.restoreAllMocks())

  it('fetches the api pages for the requested sitemap id', async () => {
    const spy = jest
      .spyOn(APISearch, 'fetch')
      .mockResolvedValue({ listings: [] } as never)

    const response = await GET(request, {
      params: Promise.resolve({ id: '1.xml' })
    })

    expect(response.status).toBe(200)
    expect(spy.mock.calls.map(([p]) => p.get.pageNum)).toEqual([6, 7, 8, 9, 10])
    // MLS privacy: only publicly displayable listings belong in sitemaps.
    expect(spy.mock.calls.every(([p]) => p.get.displayPublic === 'Y')).toBe(
      true
    )
  })

  // The API 400s on a pageNum past its own numPages, so the tail sitemap must
  // stop where the result set ends instead of spanning a blind block of five.
  it('stops the api page span at numPages', async () => {
    const spy = jest
      .spyOn(APISearch, 'fetch')
      .mockResolvedValue({ numPages: 352, listings: [] } as never)

    await GET(request, { params: Promise.resolve({ id: '70.xml' }) })

    expect(spy.mock.calls.map(([p]) => p.get.pageNum)).toEqual([351, 352])
  })

  // The `.xml` suffix is load-bearing: prerendered params must match the
  // public URL segment, otherwise the build warms nothing.
  it('pre-generates one .xml param per 500 listings', async () => {
    const spy = jest
      .spyOn(APISearch, 'fetchListingsCount')
      .mockResolvedValue({ count: 1200 } as never)

    await expect(generateStaticParams()).resolves.toEqual([
      { id: '0.xml' },
      { id: '1.xml' },
      { id: '2.xml' }
    ])
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ displayPublic: 'Y' })
    )
  })

  it('omits lastmod for missing and scrubbed dates', async () => {
    jest
      .spyOn(APISearch, 'fetch')
      .mockResolvedValueOnce({
        listings: [
          { mlsNumber: 'A1', updatedOn: '2026-08-20T10:00:00.000Z' },
          { mlsNumber: 'A2', updatedOn: listingsConfig.scrubbed.date },
          { mlsNumber: 'A3' }
        ]
      } as never)
      .mockResolvedValue({ listings: [] } as never)

    const response = await GET(request, {
      params: Promise.resolve({ id: '0.xml' })
    })
    const xml = await response.text()

    expect(xml.match(/<loc>/g)).toHaveLength(3)
    expect(xml.match(/<lastmod>/g)).toHaveLength(1)
    expect(xml).toContain('<lastmod>2026-08-20T10:00:00.000Z</lastmod>')
  })

  it('returns 404 for a non-numeric id without touching the api', async () => {
    const spy = jest.spyOn(APISearch, 'fetch')

    const response = await GET(request, {
      params: Promise.resolve({ id: 'abc.xml' })
    })

    expect(response.status).toBe(404)
    expect(spy).not.toHaveBeenCalled()
  })
})

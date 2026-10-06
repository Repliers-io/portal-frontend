import { APIListingDetails } from './APIListingDetails'

let mockExtendedHistory = true

jest.mock('@configs/listings', () => {
  const actual = jest.requireActual('@configs/listings').default
  return {
    __esModule: true,
    default: {
      ...actual,
      get extendedHistory() {
        return mockExtendedHistory
      }
    }
  }
})

const detail = {
  mlsNumber: 'N12814054',
  history: [{ mlsNumber: 'embedded' }]
}

// `fetchJSON` is public on APIBase, so the spy needs no cast.
const spyRequests = (history: unknown) =>
  jest
    .spyOn(APIListingDetails, 'fetchJSON')
    .mockImplementation((request) =>
      Promise.resolve(
        request.startsWith('/listings/history') ? history : detail
      )
    )

describe('APIListingDetails.fetchListing', () => {
  beforeEach(() => {
    mockExtendedHistory = true
  })

  afterEach(() => jest.restoreAllMocks())

  it('replaces the embedded history with the extended one', async () => {
    spyRequests({ history: [{ mlsNumber: 'extended', boardId: 2 }] })

    const listing = await APIListingDetails.fetchListing('N12814054', 90)

    expect(listing.history).toEqual([{ mlsNumber: 'extended', boardId: 2 }])
  })

  it('requests the history endpoint with the listing mls number', async () => {
    const spy = spyRequests({ history: [{ mlsNumber: 'extended' }] })

    await APIListingDetails.fetchListing('N12814054', 90)

    expect(spy).toHaveBeenCalledWith(
      '/listings/history?mlsNumber=N12814054',
      undefined
    )
  })

  it('keeps the embedded history when the extended one is empty', async () => {
    spyRequests({ history: [] })

    const listing = await APIListingDetails.fetchListing('N12814054', 90)

    expect(listing.history).toEqual([{ mlsNumber: 'embedded' }])
  })

  it('keeps the embedded history when the history request fails', async () => {
    jest
      .spyOn(APIListingDetails, 'fetchJSON')
      .mockImplementation((request) =>
        request.startsWith('/listings/history')
          ? Promise.reject(new Error('boom'))
          : Promise.resolve(detail)
      )
    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    const listing = await APIListingDetails.fetchListing('N12814054', 90)

    expect(listing.history).toEqual([{ mlsNumber: 'embedded' }])
  })

  it('keeps the embedded history and stays silent when the history request is aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    jest
      .spyOn(APIListingDetails, 'fetchJSON')
      .mockImplementation((request) =>
        request.startsWith('/listings/history')
          ? Promise.reject(new Error('aborted'))
          : Promise.resolve(detail)
      )
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    const listing = await APIListingDetails.fetchListing('N12814054', 90, {
      signal: controller.signal
    })

    expect(listing.history).toEqual([{ mlsNumber: 'embedded' }])
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('returns the detail unchanged and skips the history request when the flag is off', async () => {
    mockExtendedHistory = false
    const spy = spyRequests({ history: [{ mlsNumber: 'extended' }] })

    const listing = await APIListingDetails.fetchListing('N12814054', 90)

    expect(listing).toEqual(detail)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/listings/N12814054'),
      undefined
    )
  })

  it('propagates a rejection from the listing detail request', async () => {
    const error = new Error('detail request failed')
    jest
      .spyOn(APIListingDetails, 'fetchJSON')
      .mockImplementation((request) =>
        request.startsWith('/listings/history')
          ? Promise.resolve({ history: [{ mlsNumber: 'extended' }] })
          : Promise.reject(error)
      )

    await expect(
      APIListingDetails.fetchListing('N12814054', 90)
    ).rejects.toThrow(error)
  })

  it('forwards the same options reference to both requests', async () => {
    const options = { signal: new AbortController().signal }
    const spy = spyRequests({ history: [{ mlsNumber: 'extended' }] })

    await APIListingDetails.fetchListing('N12814054', 90, options)

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/listings/N12814054'),
      options
    )
    expect(spy).toHaveBeenCalledWith(
      '/listings/history?mlsNumber=N12814054',
      options
    )
  })
})

import { APISearch } from './APISearch'

// `fetchJSON` is public on APIBase, so the spy needs no cast.
const spyRequests = () =>
  jest
    .spyOn(APISearch, 'fetchJSON')
    .mockImplementation(() => Promise.resolve({ listings: [] }))

describe('APISearch.fetch — featured source', () => {
  afterEach(() => jest.restoreAllMocks())

  it('forwards sorting and pagination to the featured endpoint', async () => {
    const spy = spyRequests()

    await APISearch.fetch({
      get: {
        source: 'featured',
        slug: 'matt',
        sortBy: 'listPriceAsc',
        pageNum: 2,
        resultsPerPage: 24
      }
    })

    expect(spy).toHaveBeenCalledWith(
      '/listings/featured/matt?pageNum=2&resultsPerPage=24&sortBy=listPriceAsc',
      { method: 'GET' }
    )
  })

  it('drops the filters the featured endpoint does not accept', async () => {
    const spy = spyRequests()

    await APISearch.fetch({
      get: {
        source: 'featured',
        slug: 'matt',
        sortBy: 'listPriceAsc',
        class: 'condo',
        minPrice: 100000,
        status: 'A'
      }
    })

    expect(spy).toHaveBeenCalledWith(
      '/listings/featured/matt?sortBy=listPriceAsc',
      { method: 'GET' }
    )
  })

  it('never requests a slug that is not a plain identifier', async () => {
    const spy = spyRequests()

    const response = await APISearch.fetch({
      get: { source: 'featured', slug: '../../admin' }
    })

    expect(response).toBeNull()
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('APISearch.fetchAggregates', () => {
  afterEach(() => jest.restoreAllMocks())

  it('requests the paths without listings and returns each path counts', async () => {
    const spy = jest
      .spyOn(APISearch, 'fetchJSON')
      .mockImplementation(() =>
        Promise.resolve({ aggregatesUnique: { raw: { View: { lake: 3 } } } })
      )

    const counts = await APISearch.fetchAggregates(
      ['raw.View', 'details.style'],
      { class: ['condo', 'residential'], status: 'A' }
    )

    expect(spy).toHaveBeenCalledWith(
      '/listings/search?aggregatesUnique=raw.View%2Cdetails.style&class=condo&class=residential&listings=false&status=A'
    )
    expect(counts).toEqual({ 'raw.View': { lake: 3 }, 'details.style': {} })
  })
})

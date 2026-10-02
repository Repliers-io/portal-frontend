import { APILocations } from './APILocations'

const page = (ids: string[], numPages: number) => ({
  locations: ids.map((locationId) => ({ locationId, type: 'city' })),
  numPages,
  count: ids.length
})

describe('APILocations.fetchLiveByDemographics', () => {
  afterEach(() => jest.restoreAllMocks())

  const square = (min: number, max: number) => [
    [
      [
        [min, min],
        [max, min],
        [max, max],
        [min, max],
        [min, min]
      ]
    ]
  ]
  const hood = (name: string, min: number, max: number, population = 100) => ({
    locationId: name,
    name,
    type: 'neighborhood',
    size: (max - min) ** 2,
    map: { boundary: square(min, max) },
    demographics: { population }
  })
  const respond = (...locations: ReturnType<typeof hood>[]) =>
    jest
      .spyOn(APILocations, 'fetchJSON')
      .mockResolvedValueOnce({ locations } as never)

  // The API orders by centroid distance: the nearest one may not hold the point.
  it('picks the smallest neighborhood containing the point, not the nearest', async () => {
    respond(hood('park', 2, 3), hood('borough', 0, 10), hood('village', 0, 2))

    const location = await APILocations.fetchLiveByDemographics(1, 1)

    expect(location?.name).toBe('village')
  })

  it('returns null for a neighborhood without population', async () => {
    respond(hood('park', 0, 2, null as never))

    expect(await APILocations.fetchLiveByDemographics(1, 1)).toBeNull()
  })
})

describe('APILocations.fetchAllPages', () => {
  // fetch logs the upstream failure before returning null — keep it out of the run.
  beforeEach(() => jest.spyOn(console, 'error').mockReturnValue(undefined))
  afterEach(() => jest.restoreAllMocks())

  it('collects every page up to the last one', async () => {
    jest
      .spyOn(APILocations, 'fetchJSON')
      .mockResolvedValueOnce(page(['a'], 2) as never)
      .mockResolvedValueOnce(page(['b'], 2) as never)

    const locations = await APILocations.fetchAllPages({})

    expect(locations.map((l) => l.locationId)).toEqual(['a', 'b'])
  })

  // A lost page used to end the loop quietly and ship a truncated tree.
  it('throws when a page fails instead of returning what it collected', async () => {
    jest
      .spyOn(APILocations, 'fetchJSON')
      .mockResolvedValueOnce(page(['a'], 3) as never)
      .mockRejectedValueOnce(new Error('API error: 503'))

    await expect(APILocations.fetchAllPages({})).rejects.toThrow(
      'locations page 2 failed'
    )
  })

  it('throws when a page comes back empty before the last one', async () => {
    jest
      .spyOn(APILocations, 'fetchJSON')
      .mockResolvedValueOnce(page(['a'], 3) as never)
      .mockResolvedValueOnce(page([], 3) as never)

    await expect(APILocations.fetchAllPages({})).rejects.toThrow(
      'page 2 of 3 came back empty'
    )
  })
})

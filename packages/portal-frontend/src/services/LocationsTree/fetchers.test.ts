import { APILocations, APISearch } from 'services/API'

import { fetchLocationsData } from './fetchers'
import { loadStaticTree } from './static'

jest.mock('./static')

const point = (latitude: number, longitude: number) => ({ latitude, longitude })

// Toronto and its hoods, plus one location far outside `nearbyRadius`.
const treeWithCoordinates = {
  areas: [
    {
      locationId: 'area-1',
      name: 'Toronto Area',
      cities: [
        {
          locationId: 'city-1',
          name: 'Toronto',
          activeCount: 100,
          map: point(43.6532, -79.3832),
          neighborhoods: [
            {
              locationId: 'hood-1',
              name: 'Annex',
              activeCount: 10,
              map: point(43.6708, -79.4043)
            },
            {
              locationId: 'hood-2',
              name: 'Leslieville',
              activeCount: 5,
              map: point(43.6626, -79.3306)
            },
            {
              locationId: 'hood-3',
              name: 'Etobicoke',
              activeCount: 7,
              map: point(43.6205, -79.5132)
            },
            {
              locationId: 'hood-4',
              name: 'Ottawa Centre',
              activeCount: 3,
              map: point(45.4215, -75.6972)
            }
          ]
        },
        {
          locationId: 'city-2',
          name: 'Mississauga',
          activeCount: 40,
          map: point(43.589, -79.6441),
          neighborhoods: [
            {
              locationId: 'hood-5',
              name: 'Port Credit',
              activeCount: 4,
              map: point(43.5539, -79.5871)
            }
          ]
        }
      ]
    }
  ]
}

const mockTree = (tree: unknown) =>
  (loadStaticTree as jest.Mock).mockResolvedValue({
    tree,
    countsMap: new Map(),
    statusMap: new Map(),
    metadata: {},
    stats: undefined
  })

const mockApi = (locations: unknown[] = []) => {
  const search = jest.spyOn(APISearch, 'fetch').mockResolvedValue({} as never)
  const fetch = jest
    .spyOn(APILocations, 'fetch')
    .mockResolvedValue({ locations } as never)
  return { fetch, search }
}

describe('fetchLocationsData — nearby locations', () => {
  afterEach(() => jest.restoreAllMocks())

  it('computes nearbies from cached coordinates, closest first', async () => {
    mockTree(treeWithCoordinates)
    mockApi()

    const { nearbies } = await fetchLocationsData({
      city: 'Toronto',
      hood: 'Annex'
    })

    // Ottawa Centre is past nearbyRadius; Annex itself never lists itself.
    expect(nearbies.map((l) => l.name)).toEqual([
      'Leslieville',
      'Etobicoke',
      'Port Credit'
    ])
  })

  it('reaches across city lines and keeps each neighbour own city', async () => {
    mockTree(treeWithCoordinates)
    mockApi()

    const { nearbies } = await fetchLocationsData({
      city: 'Toronto',
      hood: 'Annex'
    })

    // Without its own city, Port Credit would be linked as a Toronto hood.
    expect(nearbies.find((l) => l.name === 'Port Credit')?.city).toBe(
      'Mississauga'
    )
  })

  it('spends no request on nearbies when the tree carries coordinates', async () => {
    mockTree(treeWithCoordinates)
    const { fetch } = mockApi()

    await fetchLocationsData({ city: 'Toronto', hood: 'Annex' })

    // Only the current location's polygon and the child batch — the two
    // nearby-lookup requests are gone.
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('fetchLocationsData — child map data', () => {
  afterEach(() => jest.restoreAllMocks())

  it('skips the cluster fallback when children carry coordinates', async () => {
    mockTree(treeWithCoordinates)
    const { search } = mockApi()

    await fetchLocationsData({ city: 'Toronto' })

    expect(search).not.toHaveBeenCalled()
  })

  it('keeps cached coordinates when the API row carries no map', async () => {
    mockTree(treeWithCoordinates)
    mockApi([
      { locationId: 'api-1', name: 'Leslieville', type: 'neighborhood' }
    ])

    const { hoods } = await fetchLocationsData({ city: 'Toronto' })

    expect(hoods.find((h) => h.name === 'Leslieville')?.map).toEqual(
      point(43.6626, -79.3306)
    )
  })
})

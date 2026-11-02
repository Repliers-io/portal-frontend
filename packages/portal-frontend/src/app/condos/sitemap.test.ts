import { readFileSync } from 'fs'
import { resolve } from 'path'

import content from '@configs/content'
import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { getBuildingUrl } from '@pages/condos/utils'

import { fetchLocationBuilding } from 'app/condo/_utils'
import { generateMetadata as buildingMetadata } from 'app/condo/[...slugs]/page'
import buildingSitemap from 'app/condo/sitemap'

import { type ApiBuilding } from 'services/API'
import { expandTree, loadStaticTree } from 'services/LocationsTree'
import { getLocationUrl } from 'utils/urls'

import { generateMetadata } from './[[...slugs]]/page'
import sitemap from './sitemap'

jest.mock('@templates', () => ({ PageTemplate: jest.fn() }))
jest.mock('next-intl/server', () => ({ getTranslations: jest.fn() }))
jest.mock('@pages/condos', () => ({ LocBuildingsIndexPageContent: jest.fn() }))
jest.mock('@pages/building', () => ({ BuildingPageContent: jest.fn() }))
jest.mock('providers/BuildingProvider', () => ({}))
jest.mock('app/buildings/_utils', () => ({}))
jest.mock('app/building/[...path]/_utils', () => ({}))
jest.mock('app/condo/_utils', () => ({
  ...jest.requireActual('app/condo/_utils'),
  fetchLocationBuilding: jest.fn(),
  fetchMatchedCmsBuilding: jest.fn().mockResolvedValue(null)
}))
jest.mock('services/LocationsTree', () => ({
  ...jest.requireActual('services/LocationsTree'),
  loadStaticTree: jest.fn()
}))
jest.mock('@configs/features', () => ({
  __esModule: true,
  default: { buildings: true, locations: true }
}))
jest.mock('./_utils', () => ({
  topCitiesForBuildings: 50,
  fetchCityBuildingCounts: jest.fn().mockResolvedValue({
    Seattle: 1,
    Tacoma: 1,
    Bothell: 1
  }),
  fetchHoodBuildingCounts: jest
    .fn()
    .mockImplementation(async (_city, names) =>
      Object.fromEntries(names.map((name: string) => [name, 1]))
    ),
  fetchAllBuildingsForCity: jest
    .fn()
    .mockImplementation(async (city) => [
      { id: 1, address: { city, streetNumber: '100', streetName: 'Main' } }
    ])
}))

const catalogMetadata = (slugs: string[]) =>
  generateMetadata({
    params: Promise.resolve({ slugs }),
    searchParams: Promise.resolve({})
  })

const originalLocation = { ...locationConfig }
const originalNoIndex = content.noIndex
const building = (city: string): ApiBuilding => ({
  id: 1,
  address: { city, streetNumber: '100', streetName: 'Main' }
})

beforeEach(() => {
  const raw = JSON.parse(
    readFileSync(resolve('public/urbn/locations.json'), 'utf8')
  )
  jest.mocked(loadStaticTree).mockResolvedValue({
    tree: expandTree(raw.tree.areas)
  } as never)
  Object.assign(locationConfig, {
    indexAreas: ['King'],
    showAreas: false,
    stateCode: 'WA'
  })
  content.noIndex = false
})

afterEach(() => {
  Object.assign(locationConfig, originalLocation)
  content.noIndex = originalNoIndex
  jest.clearAllMocks()
})

it('aligns condo catalogs and building metadata with both sitemaps and the MLS tree', async () => {
  const catalogUrls = (await sitemap()).map(({ url }) => url)
  const buildingUrls = (await buildingSitemap()).map(({ url }) => url)

  for (const [city, hood, excluded] of [
    ['Seattle', 'Queen Anne', false],
    ['Tacoma', 'North Tacoma', true],
    ['Bothell', '', true]
  ] as const) {
    const robots = excluded ? { index: false, follow: true } : undefined
    for (const neighborhood of ['', hood]) {
      const slugs = [
        city.toLowerCase(),
        ...(neighborhood ? [neighborhood] : [])
      ]
      expect((await catalogMetadata(slugs)).robots).toEqual(robots)
      expect(
        catalogUrls.some((url) =>
          url.endsWith(
            getLocationUrl({
              city,
              hood: neighborhood,
              basePrefix: routes.condos
            })
          )
        )
      ).toBe(!excluded)
    }

    jest.mocked(fetchLocationBuilding).mockResolvedValue(building(city))
    // The resolved building's city wins over the incoming URL's city.
    expect(
      (
        await buildingMetadata({
          params: Promise.resolve({
            slugs: ['seattle', 'queen-anne', '100-main-1']
          }),
          searchParams: Promise.resolve({})
        })
      ).robots
    ).toEqual(robots)
    expect(
      buildingUrls.some((url) => url.endsWith(getBuildingUrl(building(city))))
    ).toBe(!excluded)
  }
  expect(catalogUrls.some((url) => url.endsWith(routes.condos))).toBe(true)
  expect((await catalogMetadata([])).robots).toBeUndefined()
})

it('preserves global nofollow and leaves unrestricted tenants unchanged', async () => {
  const slugs = ['tacoma']
  content.noIndex = true
  expect((await catalogMetadata(slugs)).robots).toEqual({
    index: false,
    follow: false
  })

  locationConfig.indexAreas = []
  expect((await catalogMetadata(slugs)).robots).toBeUndefined()
  expect(
    (await sitemap()).some(({ url }) =>
      url.endsWith(
        getLocationUrl({
          city: 'Tacoma',
          basePrefix: routes.condos
        })
      )
    )
  ).toBe(true)
  expect(
    (await buildingSitemap()).some(({ url }) =>
      url.endsWith(getBuildingUrl(building('Tacoma')))
    )
  ).toBe(true)
  jest.mocked(fetchLocationBuilding).mockResolvedValue(building('Tacoma'))
  jest.mocked(loadStaticTree).mockClear()
  expect(
    (
      await buildingMetadata({
        params: Promise.resolve({
          slugs: ['tacoma', 'north-tacoma', '100-main-1']
        }),
        searchParams: Promise.resolve({})
      })
    ).robots
  ).toBeUndefined()
  expect(loadStaticTree).not.toHaveBeenCalled()
})

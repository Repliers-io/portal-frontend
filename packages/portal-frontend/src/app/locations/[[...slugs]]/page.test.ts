import { readFileSync } from 'fs'
import { resolve } from 'path'

import content from '@configs/content'
import locationConfig from '@configs/location'

import { generateMetadata as generateListingMetadata } from 'app/listing/[[...listingName]]/page'

import { expandTree, loadStaticTree } from 'services/LocationsTree'
import { getLocationUrl } from 'utils/urls'

import sitemap from '../sitemap'

import { generateMetadata } from './page'

jest.mock('@templates', () => ({ PageTemplate: jest.fn() }))
jest.mock('@pages/locations', () => ({ LocationsPageContent: jest.fn() }))
jest.mock('app/listing/[[...listingName]]/page', () => ({
  __esModule: true,
  default: jest.fn(),
  generateMetadata: jest.fn()
}))
jest.mock('services/LocationsTree', () => ({
  ...jest.requireActual('services/LocationsTree'),
  loadStaticTree: jest.fn()
}))
jest.mock('@configs/features', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('@configs/features').default,
    locations: true
  }
}))

const metadata = (...slugs: string[]) =>
  generateMetadata({ params: Promise.resolve({ slugs }) })
const originalLocation = { ...locationConfig }
const originalNoIndex = content.noIndex

beforeEach(() => {
  const raw = JSON.parse(
    readFileSync(resolve('public/urbn/locations.json'), 'utf8')
  )
  jest
    .mocked(loadStaticTree)
    .mockResolvedValue({ tree: expandTree(raw.tree.areas) } as never)
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

it('keeps metadata and sitemap membership aligned with the URBN tree', async () => {
  const entries = await sitemap()
  const urls = entries.map(({ url }) => url)
  for (const [city, hood, excluded] of [
    ['Seattle', 'Queen Anne', false],
    ['Tacoma', 'North Tacoma', true],
    ['Bothell', '', true]
  ] as const) {
    const slugs = [
      city.toLowerCase(),
      ...(hood ? [hood.toLowerCase().replaceAll(' ', '-')] : [])
    ]
    expect((await metadata(...slugs)).robots).toEqual(
      excluded ? { index: false, follow: true } : undefined
    )
    expect(
      urls.some((url) => url.endsWith(getLocationUrl({ city, hood })))
    ).toBe(!excluded)
  }
  expect((await metadata('tacoma', 'north-tacoma', 'for-sale')).robots).toEqual(
    { index: false, follow: true }
  )
  expect((await metadata()).robots).toBeUndefined()
  expect(
    (await metadata('tacoma', 'unknown-neighborhood')).robots
  ).toBeUndefined()
  expect(urls.some((url) => url.endsWith(getLocationUrl()))).toBe(true)
})

it('leaves an unrestricted tenant unchanged and preserves global nofollow', async () => {
  content.noIndex = true
  expect((await metadata('tacoma')).robots).toEqual({
    index: false,
    follow: false
  })
  locationConfig.indexAreas = []
  expect((await metadata('tacoma')).robots).toBeUndefined()
  expect(
    (await sitemap()).some(({ url }) =>
      url.endsWith(getLocationUrl({ city: 'Tacoma' }))
    )
  ).toBe(true)
})

it('delegates legacy listing metadata to the listing record regardless of the URL city', async () => {
  const result = { robots: { index: false, follow: true } }
  jest.mocked(generateListingMetadata).mockResolvedValue(result)
  expect(await metadata('seattle', 'sample-address-2593312')).toBe(result)
  expect(generateListingMetadata).toHaveBeenCalledWith({
    params: {},
    searchParams: { listingId: '2593312', boardId: expect.any(String) }
  })
  expect(loadStaticTree).not.toHaveBeenCalled()
})

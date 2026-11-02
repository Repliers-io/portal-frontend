/** @jest-environment node */
import { GET } from './route'

jest.mock('../documentation/utils', () => ({
  documentationOnly: () => true,
  documentationSites: () => ['backend', 'frontend']
}))

it('lists only the documentation sitemaps on a site kept out of the index', async () => {
  const locs = [...(await GET().text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => loc
  )

  expect(locs).toEqual([
    '/documentation/sitemap/backend.xml',
    '/documentation/sitemap/frontend.xml'
  ])
})

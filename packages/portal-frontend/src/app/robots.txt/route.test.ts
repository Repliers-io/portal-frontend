/** @jest-environment node */
import { GET } from './route'

jest.mock('../documentation/utils', () => ({ documentationOnly: () => true }))

it('lets crawlers reach only the documentation on a site kept out of the index', async () => {
  const text = await GET().text()

  expect(text).toMatch(
    /^User-agent: \*\nAllow: \/documentation\nDisallow: \/\n/
  )
  expect(text).not.toMatch(/Disallow: \/search/)
})

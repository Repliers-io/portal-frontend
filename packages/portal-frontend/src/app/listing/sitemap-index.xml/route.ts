/**
 * Listing Sitemap Index — /listing/sitemap-index.xml
 *
 * The child sitemaps are served by a Route Handler (sitemap/[id]/route.ts) at
 * /listing/sitemap/N.xml, so there is no /listing/sitemap.xml for the root
 * sitemapindex to reference — this file lists the paginated entries itself.
 *
 * Divides the count of active listings by `listingsPerSitemap` and emits one
 * <sitemap> per page:
 *   /listing/sitemap/0.xml  ← listings 1–500
 *   /listing/sitemap/1.xml  ← listings 501–1000
 *
 * Each child fetches its slice as `requestsPerSitemap` parallel API pages of
 * `apiPageSize`, sorted updatedOnDesc, under the filters used here.
 *
 * Revalidation: 1 hour (both index and each child sitemap).
 */
import { NextResponse } from 'next/server'

import features from '@configs/features'
import filtersConfig from '@configs/filters'

import { APISearch, transient } from 'services/API'
import { logError } from 'utils/log'

import { listingsPerSitemap, publicOnly } from '../_constants'

export const revalidate = 3600

const { statusFilters } = filtersConfig

export async function GET() {
  if (!features.map) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>',
      { headers: { 'Content-Type': 'application/xml' } }
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

  let pageCount = 1
  try {
    const { count } = await APISearch.fetchListingsCount({
      ...statusFilters.active,
      ...publicOnly
    })
    pageCount = Math.max(1, Math.ceil(count / listingsPerSitemap))
  } catch (error) {
    // fall back to 1 page
    logError('[sitemap-index] listings count failed:', error)
    if (transient(error)) throw error
  }

  const urls = Array.from(
    { length: pageCount },
    (_, i) => `${baseUrl}/listing/sitemap/${i}.xml`
  )

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <sitemap><loc>${url}</loc></sitemap>`),
    '</sitemapindex>'
  ].join('\n')

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}

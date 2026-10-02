/**
 * Listing sitemap pages — /listing/sitemap/<id>.xml
 *
 * ISR route handler prerendered at build via generateStaticParams. The build
 * fan-out is deliberate: these requests sweep every active listing through the
 * proxy-backend, warming its caches and populating Redis; hourly revalidation
 * keeps them warm.
 *
 * Serving does not depend on the generated id list (dynamicParams renders
 * missing ids on demand): an out-of-range id serves a valid empty urlset, so a
 * failed build-time count can never 404 the known URL set.
 *
 * The sitemap index (../sitemap-index.xml) lists these URLs.
 */
import { NextResponse } from 'next/server'

import features from '@configs/features'
import filtersConfig from '@configs/filters'
import listingsConfig from '@configs/listings'

import { APISearch, transient } from 'services/API'
import { getSeoUrl } from 'utils/listings'
import { logError } from 'utils/log'
import { createRateLimit } from 'utils/throttle'

import {
  apiPageSize,
  listingsPerSitemap,
  publicOnly,
  requestsPerSitemap
} from '../../_constants'

export const revalidate = 3600

const { statusFilters } = filtersConfig
const { scrubbed } = listingsConfig

// Paces the build-time warm-up sweep so it cannot trip the API's edge rate
// limiting (Cloudflare bans the backend IP on bursts). Sitemap fetches are the
// only build traffic that needs pacing — the rest of the build runs unthrottled.
const rateLimit = createRateLimit('NEXT_BUILD_API_RPS', 5)

const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

// 5000 sitemap pages × 500 listings — far above any board; blocks bot probes
// of absurd ids from fanning out to the API.
const maxPage = 5000

export async function generateStaticParams() {
  if (!features.map) return []
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    await rateLimit()
    const { count } = await APISearch.fetchListingsCount({
      ...statusFilters.active,
      ...publicOnly
    })
    const numPages = Math.max(1, Math.ceil(count / listingsPerSitemap))
    return Array.from({ length: numPages }, (_, i) => ({ id: `${i}.xml` }))
  } catch (error) {
    logError('[sitemap] listings count failed:', error)
    return []
  }
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!features.map) return new NextResponse('Not Found', { status: 404 })
  if (process.env.DISABLE_SSG === 'true') {
    return new NextResponse('Not Found', { status: 404 })
  }

  const { id } = await params
  const page = id.endsWith('.xml') ? Number(id.slice(0, -4)) : NaN
  if (!Number.isInteger(page) || page < 0 || page > maxPage) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Each sitemap page covers `requestsPerSitemap` API pages.
  // Sitemap id=0 → API pages 1..5, id=1 → 6..10, etc.
  const firstApiPage = page * requestsPerSitemap + 1
  const blockEnd = firstApiPage + requestsPerSitemap - 1

  const fetchApiPage = async (pageNum: number) => {
    await rateLimit()
    return APISearch.fetch(
      {
        get: {
          ...statusFilters.active,
          ...publicOnly,
          pageNum,
          resultsPerPage: apiPageSize,
          fields: 'mlsNumber,address,updatedOn,boardId',
          sortBy: 'updatedOnDesc'
        }
      },
      { next: { revalidate: 3600 } } as RequestInit
    ).catch((error) => {
      logError(`[sitemap] listings page ${pageNum} failed:`, error)
      if (transient(error)) throw error
      return null
    })
  }

  // The API rejects a pageNum past its own numPages, so the last sitemap must
  // not ask for a blind span of `requestsPerSitemap`: the first response says
  // where the result set ends and bounds the rest. Without numPages the span
  // stays full — a missing bound must not silently truncate the sitemap.
  const first = await fetchApiPage(firstApiPage)
  const lastApiPage = first?.numPages
    ? Math.min(blockEnd, first.numPages)
    : blockEnd

  const rest = await Promise.all(
    Array.from({ length: lastApiPage - firstApiPage }, (_, i) =>
      fetchApiPage(firstApiPage + i + 1)
    )
  )

  const urls = [first, ...rest].flatMap((result) =>
    (result?.listings ?? []).map((listing) => {
      const loc = `${baseUrl}${getSeoUrl(listing)}`.replace(/&/g, '%26')
      const { updatedOn } = listing
      // No lastmod when the date is unknown (missing or the MLS scrubbed
      // sentinel) — a fabricated one makes crawlers distrust ALL our lastmods.
      const lastmod =
        updatedOn && updatedOn !== scrubbed.date
          ? `<lastmod>${new Date(updatedOn).toISOString()}</lastmod>`
          : ''
      return `  <url><loc>${loc}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.5</priority></url>`
    })
  )

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>'
  ].join('\n')

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}

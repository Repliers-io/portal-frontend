import queryString from 'query-string'

import { logError } from 'utils/log'

import { type WordPressConfig, type WpMediaItem } from './types'

/**
 * Get API endpoint URL based on hosting type
 */
export function getApiUrl(config: WordPressConfig, endpoint: string): string {
  if (config.wordPressComHost) {
    // Extract site domain from baseUrl
    const siteDomain = config.baseUrl.replace(/^https?:\/\//, '')
    return `https://public-api.wordpress.com/wp/v2/sites/${siteDomain}${endpoint}`
  }
  // Self-hosted WordPress
  return `${config.baseUrl}/wp-json/wp/v2${endpoint}`
}

/**
 * Build headers with authentication
 */
export function getHeaders(
  apiKey?: string,
  applicationName?: string
): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  if (apiKey) {
    // Check if apiKey contains ":" - it's username:password for Basic Auth (Application Password)
    if (apiKey.includes(':')) {
      const base64 = Buffer.from(apiKey).toString('base64')
      headers['Authorization'] = `Basic ${base64}`
    } else {
      // Otherwise treat as Bearer token (JWT)
      headers['Authorization'] = `Bearer ${apiKey}`
    }
  }

  if (applicationName) {
    headers['X-WP-Application-Name'] = applicationName
  }

  return headers
}

/**
 * Build a curl command (including headers) that reproduces a wpFetch request,
 * so WordPress API failures can be replayed from build logs.
 */
function toCurl(url: string, headers: HeadersInit): string {
  const headerArgs = Object.entries(headers as Record<string, string>)
    .map(([key, value]) => `  -H '${key}: ${value}'`)
    .join(' \\\n')
  return `curl '${url}' \\\n${headerArgs}`
}

// Transient upstream failures (Cloudflare 522/524, gateway/timeout 5xx, 429, network errors):
// a build must not die because one CMS request blipped, so wpFetch retries these.
const transientStatuses = new Set([408, 425, 429, 500, 502, 503, 504, 522, 524])
const wpFetchRetries = 3
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Internal fetch method with authentication
 * Returns both data and headers for pagination support
 *
 * Requests use WordPress's `view` context by default. Pass `editContext: true` only for
 * fetches that genuinely need raw, unrendered values — `content.raw` (single post / page /
 * custom post) and ACF wysiwyg fields fed through autop/ACFParser (building categories).
 * Everything else (lists, counts, taxonomies, authors, media, menus) works in view context,
 * which is also smaller — the edit context returns raw + unfiltered fields that can blow
 * past the Next.js 2MB fetch-cache limit.
 */
export async function wpFetch(
  config: WordPressConfig,
  endpoint: string,
  {
    editContext = false,
    retries = wpFetchRetries
  }: { editContext?: boolean; retries?: number } = {}
): Promise<{ data: any; headers: Headers }> {
  // Opt-in only: add context=edit when explicitly requested (and authenticated) for raw fields
  if (config.apiKey && editContext) {
    const parsedUrl = queryString.parseUrl(endpoint)
    parsedUrl.query.context = 'edit'
    // eslint-disable-next-line no-param-reassign
    endpoint = queryString.stringifyUrl(parsedUrl)
  }

  const url = getApiUrl(config, endpoint)
  const headers = getHeaders(config.apiKey, config.applicationName)

  // Curl dump includes the auth header, so gate it behind an env flag to keep
  // credentials out of normal build logs. Enable with WORDPRESS_DEBUG_CURL=true.
  const fail = (error: Error): never => {
    if (process.env.WORDPRESS_DEBUG_CURL === 'true') {
      logError(`[wpFetch] reproduce with:\n${toCurl(url, headers)}`)
    }
    throw error
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    let response: Response
    try {
      response = await fetch(url, {
        headers,
        next: { revalidate: config.revalidate }
      })
    } catch (networkError) {
      // Network/DNS/timeout — transient. Retry, then give up so one blip doesn't fail the build.
      if (attempt < retries) {
        await delay(attempt * 1000)
        continue
      }
      return fail(networkError as Error)
    }

    if (!response.ok) {
      if (transientStatuses.has(response.status) && attempt < retries) {
        await delay(attempt * 1000)
        continue
      }
      return fail(
        new Error(
          `WordPress API error: ${response.status} ${response.statusText}`
        )
      )
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return fail(
        new Error(
          `WordPress API returned non-JSON response (${contentType}) for ${url}`
        )
      )
    }

    const data = await response.json()
    if (!data) {
      return fail(new Error('WordPress API returned empty response'))
    }

    return { data, headers: response.headers }
  }

  // Loop always returns or throws above; this satisfies the type checker.
  return fail(
    new Error(`WordPress API request failed after ${retries} attempts`)
  )
}

/**
 * Batch-fetch WordPress media items by IDs and return an id→item map.
 * Automatically handles batching when IDs exceed the WP REST API limit of 100.
 */
export async function fetchMediaMap(
  config: WordPressConfig,
  ids: number[]
): Promise<Map<number, WpMediaItem>> {
  if (!ids.length) return new Map()

  const batchSize = 100
  const batches: number[][] = []
  for (let i = 0; i < ids.length; i += batchSize) {
    batches.push(ids.slice(i, i + batchSize))
  }

  const results = await Promise.all(
    batches.map(async (batchIds) => {
      const query = queryString.stringify({
        include: batchIds.join(','),
        per_page: 100
      })
      const { data } = await wpFetch(config, `/media?${query}`)
      return Array.isArray(data) ? (data as WpMediaItem[]) : []
    })
  )

  const map = new Map<number, WpMediaItem>()
  for (const item of results.flat()) {
    if (item.id) map.set(item.id, item)
  }
  return map
}

type SlugItem = { slug: string; link?: string }

async function fetchAll(
  config: WordPressConfig,
  endpoint: string,
  _fields: string
): Promise<SlugItem[]> {
  const items: SlugItem[] = []
  let page = 1
  let hasMore = false

  do {
    const query = queryString.stringify({ page, per_page: 100, _fields })
    const { data } = await wpFetch(config, `${endpoint}?${query}`)

    items.push(...data)
    hasMore = data.length === 100
    page++
  } while (hasMore)

  return items
}

/**
 * Fetch all items with pagination (slugs only)
 */
export async function fetchAllSlugs(
  config: WordPressConfig,
  endpoint: string
): Promise<string[]> {
  const items = await fetchAll(config, endpoint, 'slug')
  return items.map((item) => item.slug)
}

/**
 * Fetch all items with pagination, as full relative paths derived from
 * permalinks — nested pages keep their parent segments
 * (e.g. `guides/buying-a-condo-in-seattle`), unlike WP's flat `slug`.
 */
export async function fetchAllPaths(
  config: WordPressConfig,
  endpoint: string
): Promise<string[]> {
  const items = await fetchAll(config, endpoint, 'slug,link')
  return items
    .map((item) =>
      item.link
        ? new URL(item.link).pathname.replace(/^\/|\/$/g, '')
        : item.slug
    )
    .filter(Boolean) // a WP static front page permalinks to bare '/'
}

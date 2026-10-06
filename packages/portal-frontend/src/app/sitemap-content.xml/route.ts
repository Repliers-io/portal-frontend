import { NextResponse } from 'next/server'

import features from '@configs/features'
import { type Features } from '@configs/features'
import routes from '@configs/routes'

import CmsService from 'services/CMS'

import rewritesGenerated from '../../../rewrites.generated.json'

export const revalidate = 3600

// First static rule per source wins — mirrors Next's beforeFiles matching order
const staticRewrites = new Map<string, string>()
for (const { source, destination } of rewritesGenerated) {
  if (
    !source.includes(':') &&
    !destination.includes(':') &&
    !staticRewrites.has(source)
  ) {
    staticRewrites.set(source, destination)
  }
}

/** Resolve a pretty route alias to the URL its served page canonicalizes to. */
const canonicalPath = (path: string) => staticRewrites.get(path) ?? path

const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

type PageEntry = {
  path: string
  priority: number
  changeFrequency: string
  feature?: keyof Features
}

const appRoutePages: PageEntry[] = [
  { path: routes.home, priority: 1.0, changeFrequency: 'daily' },
  {
    path: routes.blog,
    priority: 0.9,
    changeFrequency: 'daily',
    feature: 'blog'
  },
  {
    path: routes.locations,
    priority: 0.8,
    changeFrequency: 'daily',
    feature: 'locations'
  },
  {
    path: routes.condos,
    priority: 0.8,
    changeFrequency: 'monthly',
    feature: 'buildings'
  },
  {
    path: routes.buildings,
    priority: 0.8,
    changeFrequency: 'monthly',
    feature: 'buildings'
  },
  {
    path: routes.authors,
    priority: 0.7,
    changeFrequency: 'monthly',
    feature: 'blog'
  },
  { path: routes.staticPages, priority: 0.7, changeFrequency: 'monthly' },
  {
    path: routes.estimate,
    priority: 0.7,
    changeFrequency: 'monthly',
    feature: 'estimate'
  }
]

const contentRouteKeys = [
  'about',
  'privacy',
  'terms',
  'cookies',
  'dmca',
  'accessibility',
  'contact',
  'subscribe'
] satisfies Array<keyof typeof routes>

type UrlEntry = {
  url: string
  lastModified: Date
  changeFrequency: string
  priority: number
}

function toXml(entries: UrlEntry[]): string {
  const urls = entries
    .map(
      ({ url, lastModified, changeFrequency, priority }) =>
        `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastModified.toISOString()}</lastmod>\n    <changefreq>${changeFrequency}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
}

export async function GET() {
  const appRoutes: UrlEntry[] = appRoutePages
    .filter(({ feature }) => !feature || !!features[feature])
    .map(({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority
    }))

  const contentRoutes: UrlEntry[] = contentRouteKeys.map((key) => ({
    url: `${baseUrl}${canonicalPath(routes[key])}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6
  }))

  let cmsPages: UrlEntry[] = []
  try {
    const client = CmsService.getPagesClient()
    const pages = await client.getPages()

    cmsPages = pages.map((page) => ({
      url: `${baseUrl}${routes.staticPage}${page.path ?? `/${page.slug}`}`,
      lastModified: page.updatedAt || page.publishedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    }))
  } catch {
    // CMS unavailable — serve app routes + content routes only
  }

  // Resolved content routes and CMS page entries collide by design — keep the first
  const seen = new Set<string>()
  const entries = [...appRoutes, ...contentRoutes, ...cmsPages].filter(
    ({ url }) => !seen.has(url) && !!seen.add(url)
  )

  return new NextResponse(toXml(entries), {
    headers: { 'Content-Type': 'application/xml' }
  })
}

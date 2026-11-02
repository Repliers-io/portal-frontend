import { NextResponse } from 'next/server'

import { documentationOnly } from '../documentation/utils'

export const dynamic = 'force-static'

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

  const disallow = [
    '/search',
    '/favorites',
    '/image-favorites',
    '/profile',
    '/saved-searches',
    '/recently-viewed',
    '/estimate/admin',
    '/estimate/agent',
    '/locations/debug',
    '/root',
    '/login',
    '/login2',
    '/auth/',
    '/api/',
    '/_next/',
    '/unsubscribe',
    // Router prefetch URLs: Next serves them as full HTML duplicates to a plain GET.
    // They cannot be redirected in proxy — Next strips `_rsc` and the RSC header first.
    '/*_rsc='
  ]

  // The longest matching rule wins, so the documentation (hub and sites) stays
  // crawlable under the catch-all Disallow.
  const rules = documentationOnly()
    ? ['Allow: /documentation', 'Disallow: /']
    : ['Allow: /', ...disallow.map((path) => `Disallow: ${path}`)]

  const text = [
    'User-agent: *',
    ...rules,
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`
  ].join('\n')

  return new NextResponse(text, {
    headers: { 'Content-Type': 'text/plain' }
  })
}

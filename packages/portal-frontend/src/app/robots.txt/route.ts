import { NextResponse } from 'next/server'

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
    '/unsubscribe'
  ]

  const text = [
    'User-agent: *',
    'Allow: /',
    ...disallow.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`
  ].join('\n')

  return new NextResponse(text, {
    headers: { 'Content-Type': 'text/plain' }
  })
}

import { NextResponse } from 'next/server'

import features from '@configs/features'
import routes from '@configs/routes'

export const dynamic = 'force-static'

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

  const sitemaps = [
    '/sitemap-content.xml',
    features.map && `${routes.listing}/sitemap-index.xml`,
    features.locations && `${routes.locations}/sitemap.xml`,
    features.dashboard && `${routes.dashboard}/sitemap.xml`,
    features.blog && `${routes.blog}/sitemap.xml`,
    features.blog && `${routes.author}/sitemap.xml`,
    features.buildings && `${routes.condos}/sitemap.xml`,
    features.buildings && `${routes.condo}/sitemap.xml`
  ]
    .filter((s): s is string => !!s)
    .map((path) => `${baseUrl}${path}`)

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps.map((url) => `  <sitemap><loc>${url}</loc></sitemap>`),
    '</sitemapindex>'
  ].join('\n')

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}

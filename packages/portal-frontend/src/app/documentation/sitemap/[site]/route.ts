import { NextResponse } from 'next/server'

import { documentationPages, documentationSites } from '../../utils'

// Served at /documentation/sitemap/<site>.xml: a route folder named `sitemap.xml`
// under a dynamic segment is taken by Next for a static metadata file and
// prerendered once with `-` in place of every param.
export const dynamic = 'force-static'
export const dynamicParams = false

export const generateStaticParams = () =>
  documentationSites().map((site) => ({ site: `${site}.xml` }))

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ site: string }> }
) {
  const site = (await params).site.replace(/\.xml$/, '')
  const baseUrl = `${process.env.NEXT_PUBLIC_APP_DOMAIN || ''}/documentation/${site}`

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...documentationPages(site).map(
      (route) => `  <url><loc>${baseUrl}${route}</loc></url>`
    ),
    '</urlset>'
  ].join('\n')

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}

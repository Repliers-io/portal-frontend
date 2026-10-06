import React from 'react'
import { cache } from 'react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import content from '@configs/content'
import routes from '@configs/routes'
import { BlogPostTemplate, StaticPageTemplate } from '@templates'
import { StaticPageContent } from '@pages/static-pages'
// import { PagesBreadcrumbs } from '@pages/static-pages/components'
import { CmsContentRenderer } from '@shared/CmsContentRenderer'

import { type RouteParamsProps } from 'app/types'

import CmsService from 'services/CMS'
import { buildCmsMetadata } from 'utils/metadata'

type Props = RouteParamsProps<{ slug: string[] }>

// resolves page source (localOnly/remoteFirst/remoteOnly) by fullPath — see cms.ts.
// cached to deduplicate fetch between generateMetadata and component
const getPage = cache((path: string) => CmsService.getPage(path))

export const revalidate = 86400
// Pages not in generateStaticParams are generated on first request and cached
export const dynamicParams = true

export async function generateStaticParams() {
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    const client = CmsService.getPagesClient()

    const paths = (await client.getPagePaths?.()) || []
    const params = paths.map((path) => ({ slug: path.split('/') }))
    if (process.env.LOG_STATIC_PARAMS === 'true') {
      // eslint-disable-next-line no-console
      console.log('[SSG] /page/[...slug]:', JSON.stringify(params))
    }
    return params
  } catch (error) {
    console.error('Failed to generate static params for pages', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug: segments } = await params
    const fullPath = segments.join('/')
    // resolves page source (localOnly/remoteFirst/remoteOnly) by fullPath — see cms.ts.
    const page = await getPage(fullPath)

    if (!page) {
      return {
        title: 'Page Not Found'
      }
    }

    // Canonical from the page's own permalink path, not the requested URL —
    // a nested page fetched via its bare leaf slug canonicalizes to the full form
    return buildCmsMetadata(
      page,
      content.cmsMetaDefaults,
      `${routes.staticPage}${page.path ?? `/${fullPath}`}`
    )
  } catch (error) {
    console.error('Failed to generate metadata for page', error)
    return {
      title: 'Error'
    }
  }
}

const StaticPageRoute = async ({ params }: Props) => {
  const { slug: segments } = await params
  const fullPath = segments.join('/')
  // resolves page source (localOnly/remoteFirst/remoteOnly) by fullPath — see cms.ts.
  const page = await getPage(fullPath)

  if (!page) notFound()

  if (page.featuredImage && !page.layout) {
    return (
      <BlogPostTemplate>
        <StaticPageContent page={page} path={segments} />
      </BlogPostTemplate>
    )
  }

  return (
    <StaticPageTemplate title={page.title} layout={page.layout}>
      {/* {segments && <PagesBreadcrumbs path={segments} />} */}
      <CmsContentRenderer
        content={page.contentRaw ?? page.content}
        format={page.contentRaw ? 'raw' : undefined}
        layout={page.layout}
      />
    </StaticPageTemplate>
  )
}

export default StaticPageRoute

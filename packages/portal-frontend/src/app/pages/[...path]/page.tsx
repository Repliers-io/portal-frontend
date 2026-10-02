import React from 'react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import content from '@configs/content'
import routes from '@configs/routes'
import { StaticPageTemplate } from '@templates'
import { StaticPagesIndexContent } from '@pages/static-pages'

import { type RouteParamsProps } from 'app/types'

import CmsService from 'services/CMS'
import { capitalize } from 'utils/strings'

import { applyHideEmptyPages, filterPagesByPath } from '../_utils'

type Props = RouteParamsProps<{ path: string[] }>

// ISR: Revalidate every 24 hours - pages generated on-demand, cached for 86400s
export const revalidate = 86400
// Allow dynamic params - generate pages on first request instead of at build time
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params
  const pathString = '/' + path.join('/')

  return {
    title: pathString
      ? String(content.pagesMeta.pagesBrowse?.title ?? '').replace(
          '{path}',
          pathString
        )
      : String(content.pagesMeta.pagesIndex?.title ?? ''),
    description: pathString
      ? String(content.pagesMeta.pagesBrowse?.description ?? '').replace(
          '{path}',
          pathString
        )
      : String(content.pagesMeta.pagesIndex?.description ?? ''),
    openGraph: { type: 'website' as const, siteName: content.siteName },
    alternates: { canonical: `${routes.staticPages}${pathString}` }
  }
}

const PagesBrowseRoute = async ({ params }: Props) => {
  const t = await getTranslations()
  const { path } = await params
  const client = CmsService.getPagesClient()
  const pages = await client.getPages()

  // Filter pages by path - show only direct children at this level
  const filteredPages = applyHideEmptyPages(
    filterPagesByPath(pages, path),
    pages
  )

  if (filteredPages.length === 0) notFound()

  const lastSegment = path.at(-1)
  const displayName = lastSegment
    ? `${capitalize(lastSegment.replace(/-/g, ' '))}`
    : t('Breadcrumbs.pages')

  return (
    <StaticPageTemplate title={displayName}>
      <StaticPagesIndexContent pages={filteredPages} path={path} />
    </StaticPageTemplate>
  )
}

export default PagesBrowseRoute

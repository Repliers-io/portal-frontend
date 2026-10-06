import React from 'react'
import { type Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import content from '@configs/content'
import routes from '@configs/routes'
import { StaticPageTemplate } from '@templates'
import { StaticPagesIndexContent } from '@pages/static-pages'

import CmsService from 'services/CMS'

import { applyHideEmptyPages } from './_utils'

// ISR: Revalidate every 24 hours - pages generated on-demand, cached for 86400s
export const revalidate = 86400

export const metadata: Metadata = {
  ...content.pagesMeta.pagesIndex,
  alternates: { canonical: routes.staticPages }
}

const PagesIndexRoute = async () => {
  const client = CmsService.getPagesClient()
  const pages = await client.getPages()
  const topLevel = applyHideEmptyPages(
    pages.filter((p) => !p.parentId),
    pages
  )
  const t = await getTranslations()

  return (
    <StaticPageTemplate title={t('Breadcrumbs.pages')}>
      <StaticPagesIndexContent pages={topLevel} />
    </StaticPageTemplate>
  )
}

export default PagesIndexRoute

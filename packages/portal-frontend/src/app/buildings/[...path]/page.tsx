import React from 'react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { StaticPageTemplate } from '@templates'
import { BuildingsIndexContent } from '@pages/buildings'

import { type RouteParamsProps } from 'app/types'

import { capitalize } from 'utils/strings'

import {
  buildBuildingsBrowseDescription,
  buildingsPerPage,
  fetchCategoryWithBuildings
} from '../_utils'

type Props = RouteParamsProps<{ path?: string[] }>

export const revalidate = 86400
// Allow dynamic params - generate pages on first request instead of at build time
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params
  const typeSlug = path?.[0]

  if (!typeSlug) {
    return {
      title: content.pagesMeta.buildings?.title,
      description: content.pagesMeta.buildings?.description
    }
  }

  const title = capitalize(typeSlug.replace(/-/g, ' '))
  const fullTitle = `${title} - ${content.pagesMeta.buildings?.title ?? 'Buildings'}`
  return {
    title: fullTitle,
    description: buildBuildingsBrowseDescription(
      title,
      String(content.pagesMeta.buildingsBrowse?.description ?? '')
    ),
    alternates: { canonical: `${routes.buildings}/${path?.join('/')}` },
    openGraph: {
      type: 'website' as const,
      title: fullTitle,
      url: `${routes.buildings}/${path?.join('/')}`,
      siteName: content.siteName
    }
  }
}

const BuildingsBrowseRoute = async ({ params }: Props) => {
  const t = await getTranslations()

  if (!features.buildings) {
    notFound()
  }

  const { path } = await params
  const typeSlug = path?.[0]

  if (!typeSlug) {
    notFound()
  }

  const result = await fetchCategoryWithBuildings(typeSlug)

  if (!result) {
    notFound()
  }

  const { buildings } = result

  return (
    <StaticPageTemplate
      title={`${capitalize(typeSlug.replace(/-/g, ' '))} ${t('Breadcrumbs.buildings')}`}
    >
      <BuildingsIndexContent
        buildings={buildings}
        page={1}
        total={buildings.length}
        perPage={buildingsPerPage}
        baseUrl={`${routes.buildings}/${path?.join('/')}`}
      />
    </StaticPageTemplate>
  )
}

export default BuildingsBrowseRoute

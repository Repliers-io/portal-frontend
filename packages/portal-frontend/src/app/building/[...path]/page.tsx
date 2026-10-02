import React from 'react'
import { type Metadata } from 'next'
import { notFound, permanentRedirect, unstable_rethrow } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { Page40XTemplate, PageTemplate } from '@templates'
import { BuildingPageContent } from '@pages/building'

import { type RouteParamsProps } from 'app/types'

import CmsService, { type WordPressClient } from 'services/CMS'
import {
  ACFParser,
  BuildingProvider,
  type CmsBuilding
} from 'providers/BuildingProvider'
import { assembleBuilding, findCondoBuildingUrl } from 'utils/buildings'

import {
  buildBuildingDescription,
  fetchBuilding,
  fetchBuildingOgImage,
  fetchBuildingReviews,
  fetchRelatedBuildings
} from './_utils'

type Props = RouteParamsProps<{ path: string[] }>

export const revalidate = 86400
// Allow dynamic params as fallback for buildings added after the build
export const dynamicParams = true

export async function generateStaticParams(): Promise<{ path: string[] }[]> {
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    if (!features.buildings) return []

    const wpClient = CmsService.getBlogClient() as WordPressClient
    const allCategories = (await wpClient.getAllCategories()) as Array<{
      slug: string
      link?: string
      acf?: { template?: string }
    }>
    const params = allCategories
      .filter((cat) => cat.acf?.template === 'building')
      .map((building) => ({
        path: building.link
          ? new URL(building.link).pathname.split('/').filter(Boolean)
          : [building.slug]
      }))
      // Merge buildings permanently redirect to /condo-building/… — don't pre-render
      // pages that only bounce; dynamicParams still handles them (they redirect) on demand.
      .filter(({ path }) => !findCondoBuildingUrl('/' + path.join('/')))
    if (process.env.LOG_STATIC_PARAMS === 'true') {
      // eslint-disable-next-line no-console
      console.log('[SSG] /building/[...path]:', JSON.stringify(params))
    }
    return params
  } catch (error) {
    console.error('Failed to generate static params for buildings', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { path } = await params

    // Merge case → this URL permanently redirects to the Repliers building; point the
    // canonical there too (defensive: stays correct even if the redirect is removed).
    const condoUrl = findCondoBuildingUrl('/' + path.join('/'))
    if (condoUrl) {
      return { alternates: { canonical: condoUrl } }
    }

    const slug = path[path.length - 1]
    const wpClient = CmsService.getBlogClient() as WordPressClient

    const building = await wpClient.getCategoryBySlug(slug)

    if (!building) {
      return { title: 'Building Not Found' }
    }

    const ogImages = await fetchBuildingOgImage(building)

    // Yoast's snippet fields are the copy the SEO team authors in WordPress, so they win.
    // The term name and the term body text stay as the fallback for buildings with no SEO copy.
    const title = building.yoastHead?.title || building.name
    const description =
      building.yoastHead?.description ||
      buildBuildingDescription(
        building.name,
        building.description,
        String(content.pagesMeta.building?.description ?? '')
      )

    return {
      title,
      description,
      alternates: { canonical: `${routes.building}/${path.join('/')}` },
      openGraph: {
        type: 'website' as const,
        title,
        url: `${routes.building}/${path.join('/')}`,
        siteName: content.siteName,
        ...(ogImages.length > 0 && { images: ogImages })
      }
    }
  } catch (error) {
    console.error('Failed to generate metadata for building', error)
    return { title: 'Error' }
  }
}

const BuildingRoute = async ({ params }: Props) => {
  if (!features.buildings) {
    notFound()
  }

  const { path } = await params

  // Consolidate the duplicate: a CMS building that also exists in Repliers is served
  // (fuller, merged with CMS data) at /condo-building/… — send this CMS URL there
  // permanently so only one indexable page remains for the building.
  const condoUrl = findCondoBuildingUrl('/' + path.join('/'))
  if (condoUrl) {
    permanentRedirect(condoUrl)
  }

  try {
    const slug = path[path.length - 1]

    const cmsBuilding = (await fetchBuilding(slug)) as CmsBuilding | null

    if (!cmsBuilding) {
      notFound()
    }

    // Fetch CMS extras in parallel
    const [relatedBuildings, reviews] = await Promise.all([
      fetchRelatedBuildings(cmsBuilding),
      fetchBuildingReviews(cmsBuilding.slug)
    ])

    const t = await getTranslations('Building')

    const acf = cmsBuilding
      ? new ACFParser(cmsBuilding.acf, cmsBuilding._embedded, relatedBuildings)
      : undefined

    const building = assembleBuilding({
      t,
      cmsBuilding,
      acf,
      reviews
    })

    return (
      <PageTemplate>
        <BuildingProvider building={building}>
          <BuildingPageContent />
        </BuildingProvider>
      </PageTemplate>
    )
  } catch (error) {
    // notFound() above throws a NEXT_NOT_FOUND signal — let it propagate; only real
    // failures (e.g. a CMS outage) degrade to the 40X page.
    unstable_rethrow(error)
    console.error('Failed to render building page', error)
    return <Page40XTemplate />
  }
}

export default BuildingRoute

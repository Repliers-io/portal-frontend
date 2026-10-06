import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { StaticPageTemplate } from '@templates'
import { BuildingsIndexContent } from '@pages/buildings'

import { type RouteProps } from 'app/types'

import { fetchAllBuildings } from './_utils'

export const revalidate = 86400

type SearchParams = { page?: string }
type Props = RouteProps<Record<string, never>, SearchParams>

export async function generateMetadata({
  searchParams
}: Props): Promise<Metadata> {
  const { page: pageParam = '1' } = await searchParams
  const page = Number(pageParam) || 1
  const canonical =
    page <= 1 ? routes.buildings : `${routes.buildings}?page=${page}`

  return {
    title: content.pagesMeta.buildings?.title,
    description: content.pagesMeta.buildings?.description,
    alternates: { canonical },
    openGraph: {
      type: 'website' as const,
      title: String(content.pagesMeta.buildings?.title ?? ''),
      url: canonical,
      siteName: content.siteName
    }
  }
}

/**
 * Buildings Index Page
 *
 * Shows all buildings from CMS in a flat paginated grid
 * See ./README.md for structure explanation
 */
const BuildingsIndexPage = async ({ searchParams }: Props) => {
  if (!features.buildings) {
    notFound()
  }

  const { page: pageParam = '1' } = await searchParams
  const page = Number(pageParam) || 1

  const { buildings, total, perPage } = await fetchAllBuildings(page)

  // Out-of-range page numbers must 404, not serve a 200 self-canonical empty page —
  // otherwise /buildings?page=<any> is an unbounded set of indexable phantom URLs.
  const numPages = Math.ceil(total / perPage)
  if (page < 1 || page > Math.max(1, numPages)) {
    notFound()
  }

  const t = await getTranslations('Breadcrumbs')

  return (
    <StaticPageTemplate title={t('buildings')}>
      <BuildingsIndexContent
        buildings={buildings}
        page={page}
        total={total}
        perPage={perPage}
        baseUrl={routes.buildings}
      />
    </StaticPageTemplate>
  )
}

export default BuildingsIndexPage

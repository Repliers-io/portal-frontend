import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { PageTemplate } from '@templates'
import { DashboardCityPageContent } from '@pages/dashboard'

import { type RouteParamsProps } from 'app/types'

import { sanitizeUrl } from 'utils/urls'

import {
  fetchMoreCities,
  fetchWidgetStats,
  getAllCitySlugs,
  getValidCity
} from '../../_utils'

export const revalidate = 86400
// Allow dynamic params - generate pages on first request instead of at build time
export const dynamicParams = true
// Force static rendering so cookies()/headers() return empty stubs instead of
// registering a dynamic signal during ISR on-demand generation at runtime.
export const dynamic = 'force-static'

type Props = RouteParamsProps<{ city: string }>

export async function generateStaticParams() {
  if (!features.dashboard) return []
  if (process.env.DISABLE_SSG === 'true') return []

  const citySlugs = getAllCitySlugs()

  const params = citySlugs.map((city) => ({ city }))
  if (process.env.LOG_STATIC_PARAMS === 'true') {
    // eslint-disable-next-line no-console
    console.log('[SSG] /dashboard/[city]/condos:', JSON.stringify(params))
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = getValidCity(citySlug)
  const meta = content.pagesMeta.dashboardCondo

  return {
    title: String(meta?.title ?? '').replace('{city}', city),
    description: String(meta?.description ?? '').replace('{city}', city),
    alternates: {
      canonical: `${routes.dashboard}/${sanitizeUrl(city)}/condos`
    },
    openGraph: { type: 'website' as const, siteName: content.siteName }
  }
}

const CityCondoDashboardPage = async ({ params }: Props) => {
  if (!features.dashboard) notFound()

  const { city: citySlug } = await params
  const city = getValidCity(citySlug)

  if (!city) notFound()

  const propertyClass = 'condo'
  const [widgetStats, moreCities] = await Promise.all([
    fetchWidgetStats(city, propertyClass),
    fetchMoreCities({ limit: 22, exclude: [city] })
  ])

  return (
    <PageTemplate>
      <DashboardCityPageContent
        city={city}
        citySlug={citySlug}
        propertyClass={propertyClass}
        ssrData={widgetStats}
        moreCities={moreCities}
      />
    </PageTemplate>
  )
}

export default CityCondoDashboardPage

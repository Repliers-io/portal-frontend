import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import content from '@configs/content'
import features from '@configs/features'
import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { PageTemplate } from '@templates'
import DashboardPageContent from '@pages/dashboard'

import SearchProvider from 'providers/SearchProvider'

import { fetchMoreCities } from './_utils'

export const revalidate = 86400
// Force static rendering so cookies()/headers() return empty stubs instead of
// registering a dynamic signal during ISR on-demand generation at runtime.
export const dynamic = 'force-static'

export const metadata: Metadata = {
  ...content.pagesMeta.dashboard,
  alternates: { canonical: routes.dashboard }
}

const DashboardPage = async () => {
  if (!features.dashboard) notFound()

  const moreCities = await fetchMoreCities({
    limit: 15,
    exclude: locationConfig.defaultCities
  })

  return (
    <PageTemplate>
      <SearchProvider>
        <DashboardPageContent moreCities={moreCities} />
      </SearchProvider>
    </PageTemplate>
  )
}

export default DashboardPage

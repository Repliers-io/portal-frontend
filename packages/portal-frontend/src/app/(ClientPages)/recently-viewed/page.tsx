import { notFound } from 'next/navigation'

import features from '@configs/features'
import { DashboardPageTemplate } from '@templates'
import { RecentlyViewedPageContent } from '@pages/recently-viewed'

import SearchProvider from 'providers/SearchProvider'

const RecentlyViewedPage = async () => {
  if (!features.recentlyViewed) notFound()

  return (
    <DashboardPageTemplate>
      <SearchProvider>
        <RecentlyViewedPageContent />
      </SearchProvider>
    </DashboardPageTemplate>
  )
}

export default RecentlyViewedPage

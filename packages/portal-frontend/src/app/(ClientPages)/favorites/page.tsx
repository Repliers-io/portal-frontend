import { notFound } from 'next/navigation'

import features from '@configs/features'
import { DashboardPageTemplate } from '@templates'
import FavoritesPageContent from '@pages/favorites'

import SearchProvider from 'providers/SearchProvider'

const FavoritesPage = async () => {
  if (!features.favorites) notFound()

  return (
    <DashboardPageTemplate>
      <SearchProvider>
        <FavoritesPageContent />
      </SearchProvider>
    </DashboardPageTemplate>
  )
}

export default FavoritesPage

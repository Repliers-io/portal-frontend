import { notFound } from 'next/navigation'

import features from '@configs/features'
import { DashboardPageTemplate } from '@templates'
import SavedSearchesPageContent from '@pages/saved-searches'

import MapOptionsProvider from 'providers/MapOptionsProvider'
import SearchProvider from 'providers/SearchProvider'

const FavoritesPage = async () => {
  if (!features.saveSearch) notFound()

  return (
    <DashboardPageTemplate>
      <SearchProvider>
        <MapOptionsProvider layout="map" style="map">
          <SavedSearchesPageContent />
        </MapOptionsProvider>
      </SearchProvider>
    </DashboardPageTemplate>
  )
}

export default FavoritesPage

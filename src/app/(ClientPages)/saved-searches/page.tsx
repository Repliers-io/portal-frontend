import { features } from 'features'

import { DashboardPageTemplate, Page404Template } from '@templates'
import SavedSearchesPageContent from '@pages/saved-searches'

import MapOptionsProvider from 'providers/MapOptionsProvider'
import SearchProvider from 'providers/SearchProvider'

const FavoritesPage = () => {
  if (!features.saveSearch) return <Page404Template />

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

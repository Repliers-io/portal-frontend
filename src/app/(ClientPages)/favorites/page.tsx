import { features } from 'features'

import { DashboardPageTemplate, Page404Template } from '@templates'
import FavoritesPageContent from '@pages/favorites'

const FavoritesPage = () => {
  if (!features.favorites) return <Page404Template />

  return (
    <DashboardPageTemplate>
      <FavoritesPageContent />
    </DashboardPageTemplate>
  )
}

export default FavoritesPage

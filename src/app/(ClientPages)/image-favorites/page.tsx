import { features } from 'features'

import { DashboardPageTemplate, Page404Template } from '@templates'
import ImageFavoritesPageContent from '@pages/image-favorites'

const ImageFavoritesPage = () => {
  if (!features.imageFavorites) return <Page404Template />

  return (
    <DashboardPageTemplate>
      <ImageFavoritesPageContent />
    </DashboardPageTemplate>
  )
}

export default ImageFavoritesPage

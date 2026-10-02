import { notFound } from 'next/navigation'

import features from '@configs/features'
import { DashboardPageTemplate } from '@templates'
import ImageFavoritesPageContent from '@pages/image-favorites'

const ImageFavoritesPage = async () => {
  if (!features.imageFavorites) notFound()

  return (
    <DashboardPageTemplate>
      <ImageFavoritesPageContent />
    </DashboardPageTemplate>
  )
}

export default ImageFavoritesPage

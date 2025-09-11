'use client'

import { Container } from '@mui/material'

import { gridSpacing } from '@configs/cards-grids'
// TODO: fix constants import from @pages alias
import { gridColumnsMediaQueries } from '@pages/search/components/MapRoot/constants'
import { ImageFavoritesList } from '@shared/Dialogs/AiSearchDialog/components'

import useBreakpoints from 'hooks/useBreakpoints'

const ImageFavoritesPageContent = () => {
  const { mobile } = useBreakpoints()
  return (
    <Container
      disableGutters
      sx={{
        ...(mobile ? {} : gridColumnsMediaQueries),
        px: { xs: 0, sm: gridSpacing }
      }}
    >
      <ImageFavoritesList />
    </Container>
  )
}

export default ImageFavoritesPageContent

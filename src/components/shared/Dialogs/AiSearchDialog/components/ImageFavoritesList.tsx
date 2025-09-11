import { Stack } from '@mui/material'

import { gridSpacing } from '@configs/cards-grids'
import { EmptyImageFavorites } from '@shared/EmptyStates'

import { LoadingContent } from 'components/atoms'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useImageFavorites } from 'providers/ImageFavoritesProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { getCDNPath } from 'utils/urls'

import { ImageFavoritesItem } from '.'

const ImageFavoritesList = ({ embedded }: { embedded?: boolean }) => {
  const features = useFeatures()
  let submit = null
  let setLayout = null

  try {
    // WARN: DO NOT DO THIS UNLESS YOU FULLY UNDERSTAND THE CONSEQUENCES
    // eslint-disable-next-line react-hooks/rules-of-hooks
    submit = useAiSearch().submit
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setLayout = useMapOptions().setLayout
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // ignore
  }

  const { hideDialog } = useDialog('ai')
  const { loading, images, setRemoveId } = useImageFavorites()

  const handleItemClick = (image: string) => {
    if (!submit || !setLayout) return

    const imageUrl = getCDNPath(image, 'small')
    submit({ images: [imageUrl] })
    if (features.aiShowOnGrid) setLayout('grid')
    hideDialog()
  }

  const handleDeleteClick = (image: string) => {
    setRemoveId(image)
  }

  if (loading) return <LoadingContent />

  return (
    <Stack
      width="100%"
      flexWrap="wrap"
      direction="row"
      spacing={{ xs: 2, sm: embedded ? 2 : gridSpacing }}
      justifyContent={{
        xs: 'center',
        sm: images.length > 4 ? 'flex-start' : 'center'
      }}
    >
      {!images.length ? (
        <EmptyImageFavorites />
      ) : (
        images.map((image) => (
          <ImageFavoritesItem
            key={image}
            image={image}
            embedded={embedded}
            onClick={handleItemClick}
            onDelete={handleDeleteClick}
          />
        ))
      )}
    </Stack>
  )
}

export default ImageFavoritesList

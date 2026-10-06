import { cardHeight, galleryWidth } from './constants'

export const getDrawerGalleryStyles = () => {
  return {
    width: galleryWidth.xs,
    '@media (min-width: 390px)': { width: galleryWidth.sm },
    '@media (min-width: 420px)': { width: galleryWidth.lg },
    height: cardHeight,
    overflow: 'hidden',
    flexShrink: 0
  }
}

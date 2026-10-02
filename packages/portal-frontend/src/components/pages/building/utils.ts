import { type ImageResolvers } from '@shared/HeroGallery'

import { type SlideshowImage } from 'providers/BuildingProvider'

export const resolvers: ImageResolvers = {
  small: (image) => {
    // Return the smallest available image
    // Fallbacks ensure that if a size is missing, a larger size is used
    const { small, medium, large } = image as SlideshowImage
    return small || medium || large || ''
  },
  medium: (image) => {
    const { medium, large, small } = image as SlideshowImage
    return medium || large || small || ''
  },
  large: (image) => {
    const { large, medium, small } = image as SlideshowImage
    return large || medium || small || ''
  }
}

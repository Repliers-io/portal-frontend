import listingsConfig from '@configs/listings'
import {
  NavGalleryButton,
  NavSlideshowButton,
  ScrollToTopButton
} from '@shared/NavigationBar'

import { useDialog } from 'providers/DialogProvider'
import { useListing } from 'providers/ListingProvider'
import useClientSide from 'hooks/useClientSide'
import { scrubbed } from 'utils/listings'
import { getCDNPath } from 'utils/urls'

export const LeftSideButtons = ({ sticky }: { sticky: boolean }) => {
  const { listing } = useListing()
  const { showDialog: showGallery } = useDialog('gallery')
  const { showDialog: showSlideshow } = useDialog('slideshow')
  const { images: rawImages = [], imageInsights } = listing
  const images = rawImages.filter((img) => !scrubbed(img))

  const clientSide = useClientSide()

  const { slideshow: slideshowEnabled, gridGallery: gridEnabled } =
    listingsConfig.components

  const slideshow = slideshowEnabled && images.length > 1

  const gridGallery =
    gridEnabled && images.length >= listingsConfig.gallery.minImagesFor123

  const photosUpdated = listing.timestamps?.photosUpdated

  const handleGalleryClick = () => {
    const imageUrls = images.map((img) =>
      getCDNPath(img, 'large', photosUpdated)
    )
    showGallery({ images: imageUrls, imageInsights, tab: 'grid' })
  }

  const handleSlideshowClick = () => {
    const imageUrls = images.map((img) =>
      getCDNPath(img, 'large', photosUpdated)
    )
    showSlideshow({ images: imageUrls })
  }

  if (!clientSide) return null

  return (
    <>
      {slideshow && <NavSlideshowButton onClick={handleSlideshowClick} />}

      {gridGallery && <NavGalleryButton onClick={handleGalleryClick} />}

      <ScrollToTopButton sticky={sticky} />
    </>
  )
}

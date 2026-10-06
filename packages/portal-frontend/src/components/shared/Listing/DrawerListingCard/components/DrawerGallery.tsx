import { Box } from '@mui/material'

import listingsConfig from '@configs/listings'
import { Gallery } from '@shared/Photos'

import { type ApiListing } from 'services/API'
import { getCDNPath } from 'utils/urls'

import { getDrawerGalleryStyles } from '../utils'

export const DrawerGallery = ({
  listing,
  blurred = false
}: {
  listing: ApiListing
  blurred?: boolean
}) => {
  const { images = [], imagesScore = [] } = listing
  const photosUpdated = listing.timestamps?.photosUpdated
  const imageUrls = images.map((img) => getCDNPath(img, 'small', photosUpdated))
  // Restricted gallery: a single generic (blurred) photo — never the real image,
  // which must not leak even blurred. The message lives at the card level (see
  // DrawerListingCard), so the gallery only blurs here.
  const galleryImages = blurred
    ? [listingsConfig.gallery.fallbackImage]
    : imageUrls

  return (
    <Box sx={getDrawerGalleryStyles()}>
      <Box
        sx={{
          height: '100%',
          ...(blurred && {
            userSelect: 'none',
            pointerEvents: 'none',
            filter: `blur(${listingsConfig.gallery.blurRadius}px)`
          })
        }}
      >
        <Gallery images={galleryImages} scores={imagesScore} size="drawer" />
      </Box>
    </Box>
  )
}

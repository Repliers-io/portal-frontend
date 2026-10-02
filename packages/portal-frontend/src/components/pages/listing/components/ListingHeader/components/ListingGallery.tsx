'use client'

import React, { useMemo } from 'react'
import queryString from 'query-string'

import listingsConfig from '@configs/listings'
import { HeroGallery, type ImageResolvers } from '@shared/HeroGallery'
import { Tags, TagsContainer } from '@shared/Listing/ListingCard/components'

import { useListing } from 'providers/ListingProvider'
import { getIcon, resolveGalleryImages, scrubbed } from 'utils/listings'
import { getCDNPath } from 'utils/urls'

const { fallbackImage } = listingsConfig.gallery

export const ListingGallery = () => {
  const { listing, blurred } = useListing()
  const icon = getIcon(listing)
  const { images: rawImages = [], imageInsights } = listing
  const filtered = rawImages.filter((img) => !scrubbed(img))
  const images = resolveGalleryImages(filtered, blurred, fallbackImage)

  const photosUpdated = listing.timestamps?.photosUpdated

  const resolvers: ImageResolvers = useMemo(() => {
    const src = (img: string, size: string) =>
      img === fallbackImage ? img : getCDNPath(img, size, photosUpdated)
    return {
      small: (img) => src(img as string, 'small'),
      medium: (img) => src(img as string, 'medium'),
      large: (img) => src(img as string, 'large')
    }
  }, [photosUpdated])

  const {
    gridGallery: gridEnabled,
    fullscreenGallery: fullscreenEnabled,
    slideshow
  } = listingsConfig.components

  const gridGallery =
    gridEnabled && images.length >= listingsConfig.gallery.minImagesFor123

  const fullscreenGallery = fullscreenEnabled || gridEnabled

  // The param names a photo; the index is resolved here, against the very array
  // this component renders — `images` is already scrubbed-filtered and may be
  // the lone fallback for a restricted listing. Read on every render rather
  // than memoised: `window.location.search` is not reactive, so a memo has
  // nothing to invalidate on and freezes a stale index while the browser dialog
  // swaps listings in place.
  const { image } = queryString.parse(
    typeof window !== 'undefined' ? window.location.search : ''
  )
  const startImage = Math.max(images.indexOf(image as string), 0)

  return (
    <HeroGallery
      icon={icon}
      images={images}
      blurred={blurred}
      resolvers={resolvers}
      startImage={startImage}
      gridGallery={gridGallery}
      slideshowGallery={slideshow}
      fullscreenGallery={fullscreenGallery}
      imageInsights={imageInsights}
      imageActions={true}
    >
      <TagsContainer>
        <Tags listing={listing} />
      </TagsContainer>
    </HeroGallery>
  )
}

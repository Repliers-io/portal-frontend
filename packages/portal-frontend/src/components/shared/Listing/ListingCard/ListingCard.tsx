'use client'

import React, { useRef } from 'react'

import TouchRippleOriginal, {
  type TouchRippleActions,
  type TouchRippleProps
} from '@mui/material/ButtonBase/TouchRipple'

import features from '@configs/features'
import listingsConfig from '@configs/listings'
import { type ListingCardSize } from '@defaults/cards-grids'
import { Gallery } from '@shared/Photos'

import { type ApiListing } from 'services/API'
import { useUser } from 'providers/UserProvider'
import {
  getIcon,
  getSeoUrl,
  getUniqueKey,
  resolveGalleryImages,
  restrictedToGuest
} from 'utils/listings'
import { getCDNPath } from 'utils/urls'

import {
  CardContainer,
  CardContent,
  FavoritesButton,
  Tags,
  TagsContainer
} from './components'
import { useListingTags } from './useListingTags'

const { fallbackImage } = listingsConfig.gallery

type ListingCardProps = {
  listing: ApiListing
  // where this card renders, driving the status badge (see allowedGroups config)
  openInNewTab?: boolean
  size?: ListingCardSize
  onCardEnter?: (mlsNumber: string) => void
  onCardLeave?: () => void
  onGalleryEnter?: () => void
  onGalleryLeave?: () => void
  onClick?: (e: React.MouseEvent) => void
}

const TouchRipple = TouchRippleOriginal as unknown as React.FC<
  TouchRippleProps & { ref?: React.Ref<TouchRippleActions> }
>

export const ListingCard = React.memo(
  ({
    listing,
    openInNewTab,
    size = 'medium',
    onCardEnter,
    onCardLeave,
    onGalleryEnter,
    onGalleryLeave,
    onClick
  }: ListingCardProps) => {
    const { logged } = useUser()
    const rippleRef = useRef<TouchRippleActions | null>(null)

    const { images = [], imagesScore = [], matchedImage } = listing
    const icon = getIcon(listing)
    const linkUrl = getSeoUrl(listing, { image: matchedImage })
    const blurredGallery =
      features.blurRestrictedProperty && restrictedToGuest(listing, logged)

    // Resolve image URLs
    const imageSize = blurredGallery ? 'small' : 'medium'
    const photosUpdated = listing.timestamps?.photosUpdated
    const galleryImages = resolveGalleryImages(
      images,
      blurredGallery,
      fallbackImage
    )
    const imageUrls = galleryImages.map((img) =>
      img === fallbackImage ? img : getCDNPath(img, imageSize, photosUpdated)
    )
    // A blurred gallery holds the fallback alone, so the match is not in it.
    const start = Math.max(galleryImages.indexOf(matchedImage ?? ''), 0)

    const tags = useListingTags(listing)

    // shorthands
    const sizeMap = size === 'small'

    const startRipple = (e: React.MouseEvent) => {
      rippleRef.current?.start(e)
      setTimeout(() => {
        rippleRef.current?.stop(e)
      }, 150)
    }

    const handleClick = (e: React.MouseEvent) => {
      startRipple(e)
      // detect Ctrl (Win/Linux), Meta (Mac) or middle mouse button clicks as modifiers for the new tab
      const isModifierClick = e.ctrlKey || e.metaKey || e.button === 1
      const shouldOpenNewTab = openInNewTab || isModifierClick
      if (shouldOpenNewTab) {
        e.preventDefault()
        window.open(linkUrl, '_blank')
        return
      }
      onClick?.(e)
    }

    return (
      <CardContainer
        size={size}
        mlsNumber={listing.mlsNumber}
        onEnter={onCardEnter}
        onLeave={onCardLeave}
      >
        <a
          href={linkUrl}
          target={openInNewTab ? '_blank' : '_self'}
          onClick={handleClick}
          style={{ position: 'relative', display: 'block' }}
        >
          <Gallery
            size={size}
            icon={icon}
            images={imageUrls}
            start={start}
            scores={imagesScore}
            blurred={blurredGallery}
            onMouseEnter={() => onGalleryEnter?.()}
            onMouseLeave={() => onGalleryLeave?.()}
          />
          <TagsContainer size={size}>
            <Tags listing={listing} tags={tags} />
          </TagsContainer>
          <CardContent size={size} listing={listing} />
          <TouchRipple ref={rippleRef} center={false} />
        </a>
        {features.favorites && !sizeMap && (
          <FavoritesButton listing={listing} />
        )}
      </CardContainer>
    )
  },
  (prev, next) => getUniqueKey(prev.listing) === getUniqueKey(next.listing)
)

ListingCard.displayName = 'ListingCard'

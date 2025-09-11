'use client'

import React, { useRef } from 'react'

import TouchRippleOriginal, {
  type TouchRippleActions,
  type TouchRippleProps
} from '@mui/material/ButtonBase/TouchRipple'

import { type PropertyCardSize } from '@configs/cards-grids'
import { Gallery } from '@shared/Photos'

import { type Property } from 'services/API'
import { useFeatures } from 'providers/FeaturesProvider'
import { useUser } from 'providers/UserProvider'
import {
  getIcon,
  getQualityTag,
  getSeoUrl,
  getUniqueKey,
  type PropertyTag,
  restricted,
  sold
} from 'utils/properties'

import { CardContainer, CardContent, FavoritesButton, Tags } from './components'

type PropertyCardProps = {
  property: Property
  openInNewTab?: boolean
  size?: PropertyCardSize
  // tags?: string[]
  onCardEnter?: () => void
  onCardLeave?: () => void
  onGalleryEnter?: () => void
  onGalleryLeave?: () => void
  onClick?: (e: React.MouseEvent) => void
}

const TouchRipple = TouchRippleOriginal as unknown as React.FC<
  TouchRippleProps & { ref?: React.Ref<TouchRippleActions> }
>

const PropertyCard = React.memo(
  ({
    property,
    openInNewTab,
    size = 'normal',
    // tags = [],
    onCardEnter,
    onCardLeave,
    onGalleryEnter,
    onGalleryLeave,
    onClick
  }: PropertyCardProps) => {
    const { logged } = useUser()
    const features = useFeatures()
    const rippleRef = useRef<TouchRippleActions | null>(null)

    const { images = [], imagesScore = [], startImage } = property
    const icon = getIcon(property)
    const linkUrl = getSeoUrl(property, { startImage })
    const blurredGallery =
      features.blurRestrictedProperty && restricted(property) && !logged

    const tags: PropertyTag[] = []

    if (sold(property)) tags.push({ label: 'Sold', color: 'secondary' })

    const qualityTag = features.aiQuality ? getQualityTag(property) : null
    if (qualityTag) tags.push(qualityTag)

    // shorthands
    const sizeMap = size === 'map'

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
        mlsNumber={property.mlsNumber}
        size={size}
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
            images={images}
            start={startImage}
            scores={imagesScore}
            blurred={blurredGallery}
            onMouseEnter={() => onGalleryEnter?.()}
            onMouseLeave={() => onGalleryLeave?.()}
          />
          {size === 'normal' && <Tags tags={tags} />}
          <CardContent size={size} property={property} />
          <TouchRipple ref={rippleRef} center={false} />
        </a>
        {features.favorites && !sizeMap && (
          <FavoritesButton property={property} />
        )}
      </CardContainer>
    )
  },
  (prev, next) => {
    return getUniqueKey(prev.property) === getUniqueKey(next.property)
  }
)

PropertyCard.displayName = 'PropertyCard'

export default PropertyCard

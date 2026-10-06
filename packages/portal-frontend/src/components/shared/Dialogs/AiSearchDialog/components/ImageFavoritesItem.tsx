import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Box, Button, IconButton, Stack } from '@mui/material'
import { red } from '@mui/material/colors'

import gridConfig from '@configs/cards-grids'
import {
  CloseIcon,
  HomeRoundedIcon,
  ImageSearchIcon,
  OpenInNewIcon
} from '@configs/icons'

import { getSeoUrl } from 'utils/listings'
import { getCDNPath } from 'utils/urls'

import { cardHeight, cardWidth } from '../constants'

const propertyCard = gridConfig.listingCardSizes.medium

const FavoritesItem = ({
  image,
  embedded,
  onClick,
  onDelete
}: {
  image: string
  embedded?: boolean
  onClick: (image: string) => void
  onDelete: (image: string) => void
}) => {
  const [hovered, setHovered] = useState(false)
  const [linkHovered, setLinkHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)
  const t = useTranslations()

  const imageHovered = hovered && !deleteHovered
  const buttonBgColor = imageHovered
    ? 'common.black'
    : deleteHovered
      ? red[500]
      : 'common.black'

  // A favorite is stored as the image key, carrying the `?t=` cache buster the
  // gallery url had. The listing's own `images` hold the bare key, so strip it.
  const [imageKey] = image.split('?')
  const [, mlsNumber] = imageKey.match(/-(\w+)_/) || []
  const mlsLink = getSeoUrl({ mlsNumber }, { image: imageKey })

  const width = embedded ? cardWidth : Number(propertyCard.width)
  const height = embedded ? cardHeight : (Number(propertyCard.width) / 3) * 2 // 3:2 aspect ratio

  const imageUrl = getCDNPath(image, 'small')
  const searchUrl = !embedded
    ? `/search/grid?aiImage=${encodeURIComponent(imageUrl)}`
    : ''

  const handleImageClick = (e: React.MouseEvent) => {
    if (embedded) {
      onClick(image)
      e.stopPropagation()
    }
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Box
      sx={{
        borderRadius: 1,
        position: 'relative',
        boxShadow: embedded ? 0 : 1
      }}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Button
        href={searchUrl}
        variant="contained"
        onClick={handleImageClick}
        sx={{
          p: 0,
          overflow: 'hidden',
          // an image tile, not a button: keeps the card radius under pill-button themes
          borderRadius: 1,
          bgcolor: buttonBgColor,
          width: { xs: 'calc(50vw - 24px)', sm: width },
          height: { xs: 'auto', sm: height },
          aspectRatio: { xs: '1', sm: '' },
          transition: 'background-color 0.2s linear'
        }}
      >
        <Image
          alt=""
          fill
          sizes="(max-width: 600px) 50vw, 256px"
          unoptimized
          src={getCDNPath(image, 'medium')}
          style={{
            opacity: 1,
            objectFit: 'cover',
            transition: 'opacity 0.2s linear, filter 0.2s linear',
            ...(imageHovered ? { filter: 'grayscale(40%)', opacity: 0.8 } : {}),
            ...(deleteHovered ? { filter: 'grayscale(40%)', opacity: 0.7 } : {})
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            textShadow: '0 0 10px #0006',
            transition: 'opacity 0.2s linear',
            opacity: imageHovered && !linkHovered ? 1 : 0
          }}
        >
          <ImageSearchIcon />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            textShadow: '0 0 10px #0006',
            transition: 'opacity 0.2s linear',
            opacity: linkHovered ? 1 : 0
          }}
        >
          <OpenInNewIcon sx={{ mt: 0.3, mr: 0.25 }} />
        </Box>
      </Button>
      {Boolean(mlsNumber) && (
        <Link
          href={mlsLink}
          target="_blank"
          onClick={handleLinkClick}
          onMouseOver={() => setLinkHovered(true)}
          onMouseLeave={() => setLinkHovered(false)}
        >
          <Box
            sx={{
              px: 1,
              py: 0.25,
              left: 0,
              bottom: 0,
              fontSize: 12,
              bgcolor: '#0003',
              position: 'absolute',
              color: 'common.white',
              boxSizing: 'border-box',
              width: { xs: '100%', sm: 'auto' },
              borderRadius: { xs: 0, sm: '0 8px 0 0' },
              textShadow: '1px 1px 2px #0006'
            }}
          >
            <Stack spacing={0.5} direction="row" alignItems="center">
              <HomeRoundedIcon sx={{ fontSize: 14 }} />
              <span>{t('Listing.mlsNumber', { number: mlsNumber })}</span>
            </Stack>
          </Box>
        </Link>
      )}
      <IconButton
        onMouseOver={() => setDeleteHovered(true)}
        onMouseLeave={() => setDeleteHovered(false)}
        sx={{
          top: 4,
          right: 4,
          position: 'absolute',
          color: 'common.white',
          transition: 'opacity 0.2s linear ',
          ...(hovered
            ? { opacity: 1, pointerEvents: 'inherit' }
            : { opacity: 0, pointerEvents: 'none ' })
        }}
        onClick={() => onDelete(image)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}

export default FavoritesItem

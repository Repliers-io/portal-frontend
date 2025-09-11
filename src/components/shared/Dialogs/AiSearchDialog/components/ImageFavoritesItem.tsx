import React, { useState } from 'react'
import Image from 'next/legacy/image'
import Link from 'next/link'

import CloseIcon from '@mui/icons-material/Close'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Box, Button, IconButton, Stack } from '@mui/material'
import { red } from '@mui/material/colors'

import { propertyCardSizes } from '@configs/cards-grids'
import { defaultBoardId } from '@configs/search'

import { toSafeNumber } from 'utils/formatters'
import { getSeoUrl } from 'utils/properties'
import { getCDNPath } from 'utils/urls'

import { cardHeight, cardWidth } from '../constants'

const propertyCard = propertyCardSizes['normal']

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

  const imageHovered = hovered && !deleteHovered
  const buttonBgColor = imageHovered
    ? 'common.black'
    : deleteHovered
      ? red[500]
      : 'common.black'

  const matches = image.match(/-(\w+)_(\d+)/) || []
  const [, mlsNumber, startImage] = matches
  const mlsLink = getSeoUrl(
    { mlsNumber },
    { boardId: defaultBoardId, startImage: toSafeNumber(startImage) }
  )

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
          bgcolor: buttonBgColor,
          width: { xs: 'calc(50vw - 24px)', sm: width },
          height: { xs: 'auto', sm: height },
          aspectRatio: { xs: '1', sm: '' },
          transition: 'background-color 0.2s linear'
        }}
      >
        <Image
          alt=""
          unoptimized
          layout="fill"
          objectFit="cover"
          src={getCDNPath(image, 'medium')}
          style={{
            opacity: 1,
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
                <span>MLS® # {mlsNumber}</span>
              </Stack>
            </Box>
          </Link>
        )}
      </Button>
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

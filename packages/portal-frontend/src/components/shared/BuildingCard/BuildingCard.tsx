'use client'

import { useState } from 'react'
import Image from 'next/image'

import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography
} from '@mui/material'

import { DoneOutlinedIcon } from '@configs/icons'

import { ImagePlaceholder } from 'components/atoms'

export interface BuildingCardProps {
  name: string
  address?: string
  href: string
  imageUrl?: string
  size?: 'small'
  source?: 'cms' | 'repliers' | 'mixed'
}

export const BuildingCard = ({
  name,
  address,
  href,
  imageUrl,
  size,
  source
}: BuildingCardProps) => {
  const sizeSmall = size === 'small'
  const [imageError, setImageError] = useState(false)

  const cmsApproved = source === 'cms' || source === 'mixed'

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 0,
        position: 'relative',
        overflow: 'hidden',

        '&:before': {
          border: sizeSmall ? 0 : 1,
          borderColor: 'divider',
          borderRadius: 1,
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }
      }}
    >
      <CardActionArea
        href={href}
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: '66.67%',
            overflow: 'hidden'
          }}
        >
          <ImagePlaceholder icon="commercial" />

          {imageUrl && !imageError && (
            <Image
              src={imageUrl}
              alt={name}
              fill
              unoptimized
              style={{ objectFit: 'cover' }}
              onError={() => setImageError(true)}
            />
          )}
          {cmsApproved && (
            <Box
              sx={{
                p: 0.5,
                top: 0,
                right: 0,
                display: 'flex',
                position: 'absolute',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.6),
                backdropFilter: 'blur(4px)',
                borderBottomLeftRadius: '8px'
              }}
            >
              <DoneOutlinedIcon sx={{ fontSize: 18, color: 'common.white' }} />
            </Box>
          )}
        </Box>

        <CardContent
          sx={sizeSmall ? { p: 1, '&:last-child': { pb: 1 } } : undefined}
        >
          <Stack spacing={sizeSmall ? 0.5 : 1}>
            <Typography variant={sizeSmall ? 'h6' : 'h5'} noWrap={sizeSmall}>
              {name}
            </Typography>
            {address && (
              <Typography
                variant={sizeSmall ? 'caption' : 'body2'}
                color="text.secondary"
              >
                {address}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

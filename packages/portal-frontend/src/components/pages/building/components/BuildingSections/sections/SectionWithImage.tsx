'use client'

import React from 'react'
import Image from 'next/image'

import { Box, Stack, Typography } from '@mui/material'

import { CmsContentRenderer } from '@shared/CmsContentRenderer'

import type { SectionImage } from 'providers/BuildingProvider'

interface SectionWithImageProps {
  heading?: string
  content: string
  image?: SectionImage
}

export const SectionWithImage = ({
  heading,
  content,
  image
}: SectionWithImageProps) => {
  return (
    <Stack spacing={3}>
      {heading && <Typography variant="h3">{heading}</Typography>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        {image && (
          <Box sx={{ flex: 1 }}>
            <Image
              src={image.url}
              alt={image.alt || heading || ''}
              width={0}
              height={0}
              unoptimized
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 4
              }}
            />
          </Box>
        )}

        <Box sx={{ flex: 1 }}>
          <CmsContentRenderer content={content} />
        </Box>
      </Stack>
    </Stack>
  )
}

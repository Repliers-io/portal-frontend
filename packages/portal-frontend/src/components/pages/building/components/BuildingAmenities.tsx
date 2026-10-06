'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { Box, Stack, Typography } from '@mui/material'

import { CmsContentRenderer } from '@shared/CmsContentRenderer'

import { useBuilding } from 'providers/BuildingProvider'

import { BuildingSectionContainer } from '.'

const AmenitiesList = ({ amenities }: { amenities: string[] | string }) => {
  const complexStructure = typeof amenities === 'string'

  return (
    <Box
      sx={{
        '& strong:has(+ ul)': { fontSize: 24 },
        '& h4:first-of-type': { mt: 1 },
        '& b, & strong': { fontFamily: 'Poppins, sans-serif' },
        '& ul': {
          columns: { xs: 1, sm: 2 },
          columnGap: 4,
          // Reset vertical margin + padding for the tight columns layout, but keep
          // the left indent so outside-bullets stay inside the container — a bare
          // `m: 0` here zeroed the marginLeft CmsContentRenderer sets and the
          // bullets spilled left (regression of the CMS list-style fix).
          my: 0,
          pl: 0,
          ml: '1.2rem',
          '& li': {
            pl: 1,
            mb: 1,
            lineHeight: 1.5,
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
          }
        }
      }}
    >
      {complexStructure ? (
        <CmsContentRenderer content={amenities} />
      ) : (
        <ul>
          {(amenities as string[]).map((amenity: string, index: number) => (
            <Typography key={index} component="li" variant="body1">
              {amenity}
            </Typography>
          ))}
        </ul>
      )}
    </Box>
  )
}

export const BuildingAmenities = () => {
  const t = useTranslations('Building')
  const { amenities, nearbyAmenities } = useBuilding()

  const hasAmenities = Array.isArray(amenities)
    ? amenities.length > 0
    : !!amenities
  const hasNearby = nearbyAmenities.length > 0

  if (!hasAmenities && !hasNearby) return null

  return (
    <Stack id="amenities" spacing={4} width="100%">
      {hasAmenities && (
        <BuildingSectionContainer title={t('amenitiesTitle')}>
          <AmenitiesList amenities={amenities} />
        </BuildingSectionContainer>
      )}

      {hasNearby && (
        <BuildingSectionContainer title={t('nearbyAmenitiesTitle')}>
          <AmenitiesList amenities={nearbyAmenities} />
        </BuildingSectionContainer>
      )}
    </Stack>
  )
}

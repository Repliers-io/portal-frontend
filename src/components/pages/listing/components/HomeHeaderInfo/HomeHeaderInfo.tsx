'use client'

import { Box, Paper, Stack, Typography } from '@mui/material'

import { useFeatures } from 'providers/FeaturesProvider'
import { useProperty } from 'providers/PropertyProvider'
import { sold } from 'utils/properties'

import { FavoritesButton, ShareButton } from '..'

import {
  EstimatedPropertyPrice,
  FullAddressInfo,
  ImageInsights,
  ListedPropertyPrice,
  ListPropertyPrice,
  PropertyIcons,
  ShowcaseCards,
  SoldPropertyPrice
} from './components'

const HomeHeaderInfo = () => {
  const features = useFeatures()
  const { property, blurred } = useProperty()
  const { mlsNumber, listPrice, estimate } = property
  const soldProperty = sold(property)

  const reorderedSx = {
    order: { sm: 3, lg: 2 },
    minWidth: { sm: '100%', lg: 'auto' }
  }

  const pdpHeaderButtons = features.pdpShare || features.favorites

  return (
    <Stack spacing={4}>
      <Paper
        sx={{
          border: 1,
          boxShadow: 0,
          boxSizing: 'border-box',
          borderColor: 'divider',
          p: { xs: 3, sm: 4 }
        }}
      >
        <Stack spacing={2}>
          <Stack
            spacing={2}
            direction="row"
            flexWrap="wrap"
            justifyContent="space-between"
          >
            {soldProperty ? (
              <>
                <SoldPropertyPrice property={property} />
                <Box sx={reorderedSx}>
                  <ListedPropertyPrice property={property} />
                </Box>
              </>
            ) : listPrice ? (
              <>
                <ListPropertyPrice property={property} />
                {Boolean(estimate?.value) && (
                  <Box sx={reorderedSx}>
                    <EstimatedPropertyPrice property={property} />
                  </Box>
                )}
              </>
            ) : (
              ' ' // need at least somethng in markup to push buttons container to the right
            )}

            <Stack
              spacing={2}
              direction="row"
              sx={{
                order: { sm: 2, lg: 3 },
                ...(!pdpHeaderButtons && {
                  // NOTE: temporary solution until we decide how the empty layout should look
                  pointerEvents: 'none',
                  visibility: 'hidden',
                  opacity: 0
                })
              }}
            >
              {features.pdpShare && <ShareButton />}
              {features.favorites && <FavoritesButton />}
            </Stack>
          </Stack>
          <Stack
            spacing={4}
            justifyContent="space-between"
            direction={{ xs: 'column-reverse', sm: 'row' }}
          >
            <FullAddressInfo property={property} />
            <PropertyIcons property={property} />
          </Stack>

          <Typography color="text.hint">MLS® # {mlsNumber}</Typography>

          {features.aiQuality && (
            <Box pb={1}>
              <ImageInsights />
            </Box>
          )}

          {features.pdpShowcaseCards && !blurred && (
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <ShowcaseCards />
            </Box>
          )}
        </Stack>
      </Paper>
      {features.pdpShowcaseCards && !blurred && (
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <ShowcaseCards />
        </Box>
      )}
    </Stack>
  )
}

export default HomeHeaderInfo

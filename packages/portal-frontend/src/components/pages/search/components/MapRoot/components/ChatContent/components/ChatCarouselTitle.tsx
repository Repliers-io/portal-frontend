'use client'

import React from 'react'

import { Box, Button, Stack, Typography } from '@mui/material'

import { WindowOutlinedIcon } from '@configs/icons'
import { ListingsCounter } from '@shared/Filters'

import { type ChatCarouselData } from '../types'

type ChatCarouselTitleProps = {
  carousel?: ChatCarouselData
  onOpenGrid?: () => void
}

export const ChatCarouselTitle = ({
  carousel,
  onOpenGrid
}: ChatCarouselTitleProps) => {
  if (!carousel) return null

  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <ListingsCounter filters={carousel.filters} count={carousel.count} />

      {carousel.count > carousel.listings.length && (
        <Typography
          variant="body2"
          component="span"
          color="text.hint"
          sx={{ mb: -0.25 }}
        >
          ({carousel.listings.length} shown)
        </Typography>
      )}

      <Box sx={{ flex: 1, textAlign: 'right' }}>
        <Button
          size="small"
          variant="text"
          onClick={onOpenGrid}
          endIcon={<WindowOutlinedIcon fontSize="small" />}
        >
          Open Grid
        </Button>
      </Box>
    </Stack>
  )
}

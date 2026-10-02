import React from 'react'

import { Box, Stack } from '@mui/material'

import { type ListingCardSize } from '@defaults/cards-grids'

import { cardEdgeSpacing } from './utils'

type TagsContainerProps = {
  children?: React.ReactNode
  // drives the top-left inset to track the card's content padding; defaults to
  // the standard inset for off-card usages (e.g. the listing-page gallery)
  size?: ListingCardSize
}

// Positions the listing tags as an overlay in the card's top-left corner,
// independent of the gallery. Owns the placement so Tags stays a pure chip
// renderer and the inset matches the content padding in lockstep per card size.
export const TagsContainer = ({
  children,
  size = 'medium'
}: TagsContainerProps) => {
  const inset = cardEdgeSpacing(size)
  return (
    <Box
      sx={(theme) => ({
        position: 'absolute',
        // top/left are raw px in MUI (no spacing transform, unlike padding), so
        // convert the spacing unit explicitly to stay in lockstep with content
        top: theme.spacing(inset),
        left: theme.spacing(inset)
      })}
    >
      <Stack spacing={1} alignItems="flex-start">
        {children}
      </Stack>
    </Box>
  )
}

'use client'

import { createContext, type ReactNode, useContext } from 'react'

import { Stack, type StackProps, type SxProps, type Theme } from '@mui/material'

import gridConfig from '@configs/cards-grids'

// Identifies the container a ListingCard renders in (grid, carousel, map, …) and
// optionally lays the cards out. A card-internal feature (e.g. status badges) reads
// the surface to vary by container WITHOUT the card or its parents threading the
// value through props. The surface value is a neutral self-description of the
// container — it carries no badge/tenant knowledge; what a surface means is decided
// wherever it's consumed.
const CardSurfaceContext = createContext<string | null>(null)

export const useCardSurface = (): string | null =>
  useContext(CardSurfaceContext)

type CardSurfaceProps = {
  surface: string
  // 'grid' lays children out as a wrapping row of cards (the shared listing-grid
  // layout); 'bare' (default) only provides the surface context — carousels and
  // the map popup own their own layout.
  variant?: 'bare' | 'grid'
  // grid horizontal alignment. Defaults to centered on mobile, left-aligned from
  // `md` up. Containers that align by card count compute the value and pass it in
  // (the count logic stays with the container, which owns the list).
  justifyContent?: StackProps['justifyContent']
  // extra styling merged onto the grid (e.g. the search grid's loading opacity
  // and reserved min-height).
  sx?: SxProps<Theme>
  children: ReactNode
}

export const CardSurface = ({
  surface,
  variant = 'bare',
  justifyContent = { xs: 'center', md: 'flex-start' },
  sx,
  children
}: CardSurfaceProps) => (
  <CardSurfaceContext.Provider value={surface}>
    {variant === 'grid' ? (
      <Stack
        useFlexGap
        direction="row"
        flexWrap="wrap"
        spacing={gridConfig.gridSpacing}
        justifyContent={justifyContent}
        sx={sx}
      >
        {children}
      </Stack>
    ) : (
      children
    )}
  </CardSurfaceContext.Provider>
)

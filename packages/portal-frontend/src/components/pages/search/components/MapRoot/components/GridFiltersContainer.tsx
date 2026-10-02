import React from 'react'

import { Container, Stack } from '@mui/material'

import gridConfig from '@configs/cards-grids'

import { useMapOptions } from 'providers/MapOptionsProvider'

const { gridSpacing } = gridConfig

export const GridFiltersContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  const { layout } = useMapOptions()
  const gridLayout = layout === 'grid'

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{
        zIndex: 'drawer',
        position: 'relative'
      }}
    >
      <Stack
        spacing={0}
        flexWrap="wrap"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mx: 'auto',
          py: { xs: 1, sm: 1.625, md: 0 },
          px: { xs: 2, sm: gridLayout ? 3 : gridSpacing }
        }}
      >
        {children}
      </Stack>
    </Container>
  )
}

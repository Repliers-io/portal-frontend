import React from 'react'

import { Box, Stack } from '@mui/material'

import { gridSpacing } from '@configs/cards-grids'

import useBreakpoints from 'hooks/useBreakpoints'

import { gridColumnsMediaQueries, gridSideContainerWidth } from '../constants'

const FiltersTransitionContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  const { mobile, tablet } = useBreakpoints()
  return (
    <Box
      sx={{
        mx: 'auto',
        width: '100%',
        zIndex: 'drawer',
        position: 'relative',
        ...(!mobile && !tablet ? gridColumnsMediaQueries : {}),
        maxWidth: gridSideContainerWidth
      }}
    >
      <Stack
        spacing={0}
        flexWrap="wrap"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mx: { xs: gridSpacing / 4, md: gridSpacing / 2 },
          px: { xs: gridSpacing / 4, md: gridSpacing / 2 }
        }}
      >
        {children}
      </Stack>
    </Box>
  )
}

export default FiltersTransitionContainer

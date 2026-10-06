'use client'

import React, { Suspense } from 'react'

import { Box } from '@mui/material'

import searchConfig from '@configs/search'

import useBreakpoints from 'hooks/useBreakpoints'

export const AutosuggestionContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  const { mobile, tablet } = useBreakpoints()

  if (searchConfig.autosuggestPosition === 'filters') {
    if (!mobile && !tablet) return null
  }

  return (
    <Box
      sx={{
        display: {
          xs: 'flex',
          md: searchConfig.autosuggestPosition === 'menu' ? 'flex' : 'none'
        },
        width: { xs: 'auto', sm: '50%', md: 'auto' },
        pl: { xs: 0, md: 1, lg: 3 },
        pr: { xs: 0, lg: 1 },
        maxWidth: 320,
        flex: 1
      }}
    >
      <Suspense>{children}</Suspense>
    </Box>
  )
}

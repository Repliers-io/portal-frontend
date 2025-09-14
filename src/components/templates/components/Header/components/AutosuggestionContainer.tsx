import React, { Suspense } from 'react'

import { Box } from '@mui/material'

import { useFeatures } from 'providers/FeaturesProvider'

const AutosuggestionContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  const features = useFeatures()

  return (
    <Box
      sx={{
        display: {
          xs: 'flex',
          md: features.searchPosition === 'menu' ? 'flex' : 'none'
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
export default AutosuggestionContainer

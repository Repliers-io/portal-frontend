import React from 'react'

import { CircularProgress, Typography } from '@mui/material'

type PriceTimelineTitleProps = {
  children: React.ReactNode
  loading?: boolean
}

export const PriceTimelineTitle = ({
  children,
  loading
}: PriceTimelineTitleProps) => (
  <Typography variant="h3" width={{ xs: '100%', sm: 'auto' }}>
    {children}
    {loading && <CircularProgress size={16} sx={{ ml: 2 }} />}
  </Typography>
)

import React from 'react'

import { Typography } from '@mui/material'
import Grid, { type GridProps } from '@mui/material/Grid' // Grid version 2

const GridSection = (props: GridProps) => {
  const { children, ...rest } = props
  return (
    <Grid {...rest} size={12}>
      <Typography variant="h3">{children}</Typography>
    </Grid>
  )
}

export default GridSection

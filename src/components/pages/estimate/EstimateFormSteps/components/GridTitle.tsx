import React from 'react'

import { Typography } from '@mui/material'
import Grid, { type Grid2Props } from '@mui/material/Grid2' // Grid version 2

const GridSection = (props: Grid2Props) => {
  const { children, ...rest } = props
  return (
    <Grid {...rest} size={12}>
      <Typography variant="h3">{children}</Typography>
    </Grid>
  )
}

export default GridSection

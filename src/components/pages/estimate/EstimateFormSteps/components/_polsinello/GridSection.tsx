import { type ReactNode } from 'react'

import Grid from '@mui/material/Grid2' // Grid version 2

const GridSection = ({ children }: { children: ReactNode }) => {
  return (
    <Grid container columns={12} spacing={4} width="100%" sx={{ mb: 4 }}>
      {children}
    </Grid>
  )
}
export default GridSection

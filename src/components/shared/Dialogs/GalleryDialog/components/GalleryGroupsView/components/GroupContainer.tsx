import React from 'react'

import { Box, Grid2 as Grid } from '@mui/material'

import { GroupHeader } from '.'

const GroupContainer = ({
  name,
  children
}: {
  name: string
  children: React.ReactNode
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <GroupHeader name={name} />

      <Grid
        container
        columns={6}
        spacing={1}
        sx={{ borderRadius: 2, overflow: 'hidden' }}
      >
        {children}
      </Grid>
    </Box>
  )
}

export default GroupContainer

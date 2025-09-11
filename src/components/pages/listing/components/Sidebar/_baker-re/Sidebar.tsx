import React from 'react'

import { Box, Paper, Skeleton, Typography } from '@mui/material'

import useClientSide from 'hooks/useClientSide'

import { RequestInfoForm } from '../components'

const Sidebar = () => {
  const clientSide = useClientSide()

  return clientSide ? (
    <Paper
      sx={{
        border: 1,
        borderColor: 'divider',
        boxShadow: { xs: 0, md: 1 }
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" p={2.5}>
        <Typography variant="button" color="text.secondary">
          Request info
        </Typography>
      </Box>
      <Box
        sx={{
          mt: '-1px',
          borderTop: 1,
          p: { xs: 3, md: 2 },
          borderColor: 'divider'
        }}
      >
        <Box>
          <RequestInfoForm />
        </Box>
      </Box>
    </Paper>
  ) : (
    <Skeleton variant="rounded" height={740} sx={{ borderRadius: 2 }} />
  )
}

export default Sidebar

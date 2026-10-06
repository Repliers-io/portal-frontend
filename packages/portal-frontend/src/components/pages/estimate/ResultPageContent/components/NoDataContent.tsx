import React from 'react'

import { Box, Button, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'

const NoDataContent = () => {
  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', display: 'flex' }}>
      <Stack justifyContent="space-between" sx={{ px: 2, py: 10, flex: 1 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h2">No data available</Typography>

          <Typography>Try another address</Typography>
        </Stack>

        <Stack
          width="100%"
          alignItems="center"
          justifyContent="center"
          sx={{ flex: 1, pb: 8 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{ width: { xs: '100%', sm: '200px' } }}
            href={routes.estimate}
          >
            Get Estimate
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default NoDataContent

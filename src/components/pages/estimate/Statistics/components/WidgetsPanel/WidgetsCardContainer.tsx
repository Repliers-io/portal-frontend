import React from 'react'

import { CircularProgress, Paper, Stack } from '@mui/material'

const WidgetsCardContainer = ({
  loading,
  children
}: {
  loading: boolean
  children: React.ReactNode
}) => {
  return (
    <Paper
      sx={{
        px: 3,
        py: 2.5,
        minHeight: 128,
        position: 'relative',
        boxSizing: 'border-box',

        '&::before': {
          content: '""',
          bgcolor: 'primary.main',
          position: 'absolute',
          height: '100%',
          width: '8px',
          bottom: 0,
          left: 0,
          top: 0,
          m: 0
        }
      }}
    >
      <Stack direction="column" gap={2}>
        {loading ? <CircularProgress size={18} /> : children}
      </Stack>
    </Paper>
  )
}

export default WidgetsCardContainer

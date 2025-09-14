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
        flex: '1 1 320px',
        minHeight: 128,
        px: 3,
        py: 2.5,
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      <Stack direction="column" gap={2}>
        {loading ? <CircularProgress size={18} /> : children}
      </Stack>
    </Paper>
  )
}

export default WidgetsCardContainer

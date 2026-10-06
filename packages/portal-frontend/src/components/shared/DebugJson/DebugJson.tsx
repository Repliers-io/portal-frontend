import React from 'react'

import { Box, type SxProps, type Theme } from '@mui/material'

type DebugJsonProps = {
  data: unknown
  sx?: SxProps<Theme>
}

export const DebugJson = ({ data, sx }: DebugJsonProps) => {
  return (
    <Box
      component="pre"
      sx={{
        mt: 4,
        p: 2,
        borderRadius: 2,
        bgcolor: 'grey.100',
        overflow: 'auto',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        border: '1px solid',
        borderColor: 'grey.300',
        ...sx
      }}
    >
      {JSON.stringify(data, null, 2)}
    </Box>
  )
}

'use client'

import React from 'react'

import { Box, Stack, Typography } from '@mui/material'

interface InfoItemTextProps {
  label: string
  value: React.ReactNode | string
}

export const InfoItemText = ({ label, value }: InfoItemTextProps) => {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderRadius: 1,
        bgcolor: 'background.default',
        boxSizing: 'border-box',
        height: '100%',
        display: 'flex'
      }}
    >
      <Stack
        spacing={0.5}
        direction={{ xs: 'row', sm: 'column' }}
        sx={{ width: '100%' }}
      >
        <Typography variant="body2" lineHeight="28px">
          {label}:
        </Typography>
        <Typography
          variant="h5"
          sx={{
            flex: 1,
            alignSelf: { xs: 'center', sm: 'auto' },
            textAlign: { xs: 'right', sm: 'left' },
            '& a:hover': { textDecoration: 'underline' }
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  )
}

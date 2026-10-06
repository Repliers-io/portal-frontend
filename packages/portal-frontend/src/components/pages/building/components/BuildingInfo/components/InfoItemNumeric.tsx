'use client'

import React from 'react'

import { Box, Stack, Typography } from '@mui/material'

interface InfoItemNumericProps {
  label: string
  value: string | number
}

export const InfoItemNumeric = ({ label, value }: InfoItemNumericProps) => {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderRadius: 1,
        bgcolor: 'background.default',
        boxSizing: 'border-box',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Stack
        spacing={0}
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        sx={{ width: '100%' }}
      >
        <Typography variant="body2">{label}:</Typography>
        <Typography
          variant="h2"
          sx={{
            flex: 1,
            textAlign: { xs: 'right', sm: 'center' },
            fontSize: '48px',
            color: 'primary.dark',
            px: { xs: 0, sm: 2 }
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  )
}

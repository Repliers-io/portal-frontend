import React from 'react'

import { Box, Stack, Typography } from '@mui/material'

import { AddressSection } from './sections'

const AddressStep = () => {
  return (
    <Stack
      spacing={4}
      alignItems="center"
      sx={{
        pt: { xs: 6, sm: 0 },
        minHeight: { xs: 'auto', sm: 'min(69vh, 532px)' },
        position: 'relative',
        zIndex: 2
      }}
    >
      <Stack
        spacing={1}
        textAlign="center"
        sx={{
          '& .MuiTypography-root br': {
            display: {
              sx: 'inline',
              sm: 'none'
            }
          }
        }}
      >
        <Typography
          variant="h1"
          sx={{ color: 'common.white', textShadow: '0 0 20px #0003' }}
        >
          How much <br /> is my home worth?
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'common.white', textShadow: '0 0 10px #0003' }}
        >
          Enter your address to get your free estimate <br /> instantly and
          claim your home.
        </Typography>
      </Stack>
      <Box maxWidth="sm" width="100%">
        <Box
          sx={{
            boxShadow: 1,
            borderRadius: 2,
            background: '#FFF8',
            backdropFilter: 'blur(12px)',
            p: { xs: 2.5, sm: 3, md: 4 },
            '& .MuiOutlinedInput-root:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline':
              {
                borderColor: 'transparent !important'
              }
          }}
        >
          <AddressSection />
        </Box>
      </Box>
    </Stack>
  )
}

export default AddressStep

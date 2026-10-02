import React, { useState } from 'react'

import { Box, Paper, Skeleton, Tab, Tabs } from '@mui/material'

import useClientSide from 'hooks/useClientSide'

import { RequestInfoForm, TourHomeForm } from './components'

export const ListingContactForm = () => {
  const clientSide = useClientSide()
  const [value, setValue] = useState(0)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return clientSide ? (
    <Paper
      sx={{
        border: 1,
        borderColor: 'divider',
        boxShadow: { xs: 0, md: 1 }
      }}
    >
      <Tabs value={value} variant="fullWidth" onChange={handleChange}>
        <Tab label="Tour home" sx={{ px: 0 }} />
        <Tab label="Request info" sx={{ px: 0 }} />
      </Tabs>
      <Box
        sx={{
          mt: '-1px',
          borderTop: 1,
          p: { xs: 2, sm: 3, md: 2 },
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: value === 0 ? 'block' : 'none' }}>
          <TourHomeForm />
        </Box>
        <Box sx={{ display: value === 1 ? 'block' : 'none' }}>
          <RequestInfoForm />
        </Box>
      </Box>
    </Paper>
  ) : (
    <Skeleton variant="rounded" height={696} sx={{ borderRadius: 2 }} />
  )
}

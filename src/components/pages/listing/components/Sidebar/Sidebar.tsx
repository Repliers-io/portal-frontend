import React, { useState } from 'react'

import { Box, Paper, Skeleton, Tab, Tabs } from '@mui/material'

import useClientSide from 'hooks/useClientSide'

import { RequestInfoForm, TourHomeForm } from './components'

const Sidebar = () => {
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
        <Tab label="Tour home" />
        <Tab label="Request info" />
      </Tabs>
      <Box
        sx={{
          mt: '-1px',
          borderTop: 1,
          p: { xs: 3, md: 2 },
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
    <Skeleton variant="rounded" height={740} sx={{ borderRadius: 2 }} />
  )
}

export default Sidebar

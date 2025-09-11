import React from 'react'

import { Box, Typography } from '@mui/material'

const OptionGroup = ({
  group,
  children
}: {
  group: string
  children: React.ReactNode
}) => {
  const labels: { [key: string]: string } = {
    city: 'Areas',
    neighborhood: 'Neighborhoods',
    address: 'Addresses',
    listing: 'Listings'
  }
  const label = labels[group] || ''

  return (
    <Box>
      {label && (
        <Typography variant="h6" sx={{ px: 2, pt: 1, pb: 2 }}>
          {label}
        </Typography>
      )}
      {children}
    </Box>
  )
}

export default OptionGroup

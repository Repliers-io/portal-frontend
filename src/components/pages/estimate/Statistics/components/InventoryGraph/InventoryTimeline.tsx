import React from 'react'

import { Box, Typography } from '@mui/material'

const InventoryTimeline = ({
  value,
  visible = true,
  animate = true
}: {
  value: number
  visible?: boolean
  animate?: boolean
}) => {
  if (!value) return null

  return (
    <Box
      sx={{
        left: 0,
        right: 0,
        top: '28%',
        textAlign: 'center',
        position: 'absolute',
        opacity: visible ? 1 : 0,
        transition: animate ? 'opacity 0.5s linear 1s' : 'none'
      }}
    >
      <Typography
        sx={{
          whiteSpace: 'nowrap',
          fontSize: '0.75rem',
          fontWeight: 400
        }}
      >
        {Math.round(value * 10) / 10} months of inventory
      </Typography>
    </Box>
  )
}

export default InventoryTimeline

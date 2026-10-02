import React from 'react'

import type { BoxProps } from '@mui/material'
import { Box, Typography } from '@mui/material'

interface BadgeProps extends BoxProps {
  text?: string
}
const Badge: React.FC<BadgeProps> = ({ text = 'SPECIAL OFFER', ...props }) => {
  return (
    <Box
      px={1}
      height={28}
      display="inline-flex"
      alignItems="center"
      border={1}
      borderColor="common.white"
      boxSizing="border-box"
      borderRadius={1}
      {...props}
    >
      <Typography variant="button" color="common.white" fontWeight="bold">
        {text}
      </Typography>
    </Box>
  )
}

export default Badge

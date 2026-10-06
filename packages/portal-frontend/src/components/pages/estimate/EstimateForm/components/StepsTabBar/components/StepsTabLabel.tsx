import React from 'react'

import { Typography } from '@mui/material'

const StepsTabLabel = ({
  available,
  children
}: {
  available?: boolean
  children: React.ReactNode
}) => {
  return (
    <Typography
      variant="h4"
      color={available ? 'common.black' : 'text.hint'}
      noWrap
    >
      {children}
    </Typography>
  )
}

export default StepsTabLabel

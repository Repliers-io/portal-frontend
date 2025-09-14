import React, { type ReactNode } from 'react'

import { Box, Paper, type PaperProps, Typography } from '@mui/material'

interface DetailsContainerProps extends PaperProps {
  id?: string
  title?: string
  children: ReactNode
}

const DetailsContainer: React.FC<DetailsContainerProps> = ({
  id,
  title,
  children,
  ...rest
}) => {
  return (
    <Paper
      id={id}
      sx={{
        border: 1,
        boxShadow: 0,
        overflow: 'hidden',
        borderColor: 'divider'
      }}
      {...rest}
    >
      {title && (
        <Typography
          variant="h4"
          sx={{ px: { xs: 3, sm: 4 }, py: 3, bgcolor: 'divider' }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ p: { xs: 3, sm: 4 }, width: '100%', boxSizing: 'border-box' }}>
        {children}
      </Box>
    </Paper>
  )
}

export default DetailsContainer

import React from 'react'

import { Box } from '@mui/material'

interface ProfileContainerProps {
  children: React.ReactNode
}

const ProfileContainer: React.FC<ProfileContainerProps> = ({ children }) => {
  return (
    <Box
      p={4}
      maxWidth={{
        xs: '100%',
        md: 320
      }}
      bgcolor="common.white"
      borderRadius={2}
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
      sx={{
        border: '1px solid #cdcdcd',
        overflow: 'hidden',
        '&:after': {
          content: '""',
          inset: 0,
          position: 'absolute',
          height: '4px',
          bgcolor: 'primary.main',
          m: 0
        }
      }}
    >
      {children}
    </Box>
  )
}

export default ProfileContainer

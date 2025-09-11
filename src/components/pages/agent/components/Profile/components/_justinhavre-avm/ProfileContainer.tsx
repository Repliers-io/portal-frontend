import React from 'react'

import { Paper, Stack } from '@mui/material'

interface BoxWrapperProps {
  children: React.ReactNode
}

const ProfileContainer: React.FC<BoxWrapperProps> = ({ children }) => {
  return (
    <Paper sx={{ p: 3, position: 'sticky', top: 32 }}>
      <Stack spacing={1} alignItems="center" width="100%">
        {children}
      </Stack>
    </Paper>
  )
}

export default ProfileContainer

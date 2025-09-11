import React from 'react'

import { Button } from '@mui/material'

const ProfileMenuButton = ({
  children,
  ...props
}: React.ComponentProps<typeof Button> & { children: React.ReactNode }) => {
  return (
    <Button
      fullWidth
      variant="text"
      sx={{
        height: 44,
        transition: 'color 0.2s linear, text-decoration 0.2s linear',
        '&:hover': {
          textDecoration: 'underline',
          color: { xs: 'primary.main', md: 'white' }
        }
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export default ProfileMenuButton

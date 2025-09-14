import React from 'react'

import { Button } from '@mui/material'

const ProfileMenuButton = ({
  children,
  ...props
}: React.ComponentProps<typeof Button> & { children: React.ReactNode }) => {
  return (
    <Button fullWidth variant="outlined" sx={{ height: 44 }} {...props}>
      {children}
    </Button>
  )
}

export default ProfileMenuButton

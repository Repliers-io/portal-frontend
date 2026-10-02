import React from 'react'

import { Button } from '@mui/material'

import useClientSide from 'hooks/useClientSide'

export const ProfileMenuButton = ({
  children,
  ...props
}: React.ComponentProps<typeof Button> & { children: React.ReactNode }) => {
  const clientSide = useClientSide()

  if (!clientSide) return null

  return (
    <Button
      fullWidth
      variant="outlined"
      sx={{ height: 44, px: 1.5 }}
      {...props}
    >
      {children}
    </Button>
  )
}

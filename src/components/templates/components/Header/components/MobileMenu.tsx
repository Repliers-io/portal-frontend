'use client'

import { useEffect, useState } from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import { Box, Drawer, IconButton, Stack } from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'

import ProfileMenuPill from './ProfileMenuPill'
import ToolbarMenu from './ToolbarMenu'

const MobileMenu = () => {
  const [open, setOpen] = useState(false)
  const { desktop } = useBreakpoints()

  useEffect(() => {
    if (desktop) setOpen(false)
  }, [desktop])

  return (
    <>
      <IconButton onClick={() => setOpen(!open)} color="inherit">
        <MenuIcon />
      </IconButton>
      <Drawer
        elevation={1}
        anchor="top"
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        disableScrollLock
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          zIndex: 'drawer',
          '& .MuiDrawer-paper': {
            borderRadius: 0,
            bgcolor: 'common.white'
          }
        }}
      >
        <Box sx={{ p: 2, mt: { xs: '64px', sm: '72px' } }}>
          <Stack spacing={2} alignItems="center">
            <ToolbarMenu />
            <ProfileMenuPill />
          </Stack>
        </Box>
      </Drawer>
    </>
  )
}

export default MobileMenu

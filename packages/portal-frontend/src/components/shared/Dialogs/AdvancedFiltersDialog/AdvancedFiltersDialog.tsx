'use client'

import { Drawer } from '@mui/material'

import { useDialog } from 'providers/DialogProvider'
import useBreakpoints from 'hooks/useBreakpoints'

import { AdvancedFiltersForm } from './components'

export const dialogName = 'filters'

export const AdvancedFiltersDialog = () => {
  const { mobile } = useBreakpoints()
  const { visible, animate, hideDialog } = useDialog(dialogName)

  const anchor = mobile ? 'bottom' : 'right'

  return (
    <Drawer
      open={visible}
      anchor={anchor}
      onClose={hideDialog}
      slotProps={{ transition: { timeout: animate ? 200 : 0 } }}
      sx={{
        zIndex: 'modal',
        // the drawer's own paper only: `.MuiPaper-root` also reaches every nested
        // Paper (the Features accordions)
        '& .MuiDrawer-paper': {
          borderRadius: 0, // override default border radius
          // pin the width so the drawer stays the same size while loading
          width: { xs: '100%', sm: 480 },
          height: '100%'
        }
      }}
    >
      <AdvancedFiltersForm onReset={hideDialog} onSubmit={hideDialog} />
    </Drawer>
  )
}

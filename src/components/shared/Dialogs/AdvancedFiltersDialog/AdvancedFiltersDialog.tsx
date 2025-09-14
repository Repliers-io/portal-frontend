'use client'

import { Drawer } from '@mui/material'

import { useDialog } from 'providers/DialogProvider'
import useBreakpoints from 'hooks/useBreakpoints'

import { AdvancedFiltersForm } from './components'

export const dialogName = 'filters'

const AdvancedFiltersDialog = () => {
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
        '& .MuiPaper-root': {
          borderRadius: 0, // override default border radius
          maxWidth: { xs: '100%', sm: 480 },
          height: '100%'
        }
      }}
    >
      <AdvancedFiltersForm onReset={hideDialog} onSubmit={hideDialog} />
    </Drawer>
  )
}

export default AdvancedFiltersDialog

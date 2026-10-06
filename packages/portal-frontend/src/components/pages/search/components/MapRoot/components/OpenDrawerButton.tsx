import { alpha, Button } from '@mui/material'

import { primary } from '@configs/colors'

import { useMapOptions } from 'providers/MapOptionsProvider'

// MapRoot renders it on mobile and tablet only.
export const OpenDrawerButton = () => {
  const { layout, setLayout } = useMapOptions()
  const handleLayoutSwitch = () => {
    setLayout(layout === 'map' ? 'grid' : 'map')
  }

  return (
    <Button
      size="small"
      variant="contained"
      onClick={handleLayoutSwitch}
      sx={{
        top: { xs: 8, sm: 12 },
        left: '50%',
        zIndex: 'tooltip',
        position: 'absolute',
        transform: 'translateX(-50%)',
        width: 120,
        backdropFilter: 'blur(8px)',
        bgcolor: alpha(primary, 0.8),
        // `&&` outranks the theme's `disableElevation`
        '&&': { boxShadow: 1 }
      }}
    >
      {layout === 'map' ? 'List View' : 'Map View'}
    </Button>
  )
}

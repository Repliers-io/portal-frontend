import { alpha, Button } from '@mui/material'

import { primary } from '@configs/colors'

const OpenDrawerButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      size="small"
      variant="contained"
      sx={{
        width: 120,
        top: { xs: '8px', sm: '16px' },
        left: '50%',
        ml: '-60px',
        boxShadow: 1,
        zIndex: 'tooltip',
        position: 'absolute',
        backdropFilter: 'blur(4px)',
        bgcolor: alpha(primary, 0.8),
        display: { xs: 'block', md: 'none' }
      }}
      onClick={onClick}
    >
      Gallery
    </Button>
  )
}

export default OpenDrawerButton

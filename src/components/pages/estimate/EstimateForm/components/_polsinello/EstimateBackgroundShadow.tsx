import { Box } from '@mui/material'

const EstimateBackgroundShadow = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        position: 'absolute',
        background: '#0008',
        transition: collapsed ? 'none' : 'opacity 0.3s',
        backdropFilter: 'blur(4px)',
        ...(collapsed
          ? { borderRadius: 2, opacity: 0 } // fix for blinking rectangle behind <Paper> after form resizing (go back to step 0 from 1)
          : { borderRadius: 0, opacity: 1 })
      }}
    />
  )
}

export default EstimateBackgroundShadow

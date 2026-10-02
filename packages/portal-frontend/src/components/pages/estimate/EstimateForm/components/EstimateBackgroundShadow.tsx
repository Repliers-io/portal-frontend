import { Box } from '@mui/material'

const EstimateBackgroundShadow = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <Box
      sx={{
        inset: 0,
        position: 'absolute',
        background: '#0008',
        transition: collapsed ? 'none' : 'opacity 0.3s',
        ...(collapsed
          ? { borderRadius: 3, opacity: 0 } // fix for blinking rectangle behind <Paper> after form resizing (go back to step 0 from 1)
          : { borderRadius: 0, opacity: 1 })
      }}
    />
  )
}

export default EstimateBackgroundShadow

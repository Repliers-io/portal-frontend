import { Box, Typography } from '@mui/material'

export const NotEnoughData = () => {
  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(20px)'
      }}
    >
      <Typography variant="h6">No data</Typography>
    </Box>
  )
}

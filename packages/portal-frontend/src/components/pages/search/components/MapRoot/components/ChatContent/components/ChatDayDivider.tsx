import { Box, Divider, Typography } from '@mui/material'

export const ChatDayDivider = ({ date }: { date: number }) => {
  const dateObj = new Date(date)

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  return (
    <Box
      sx={{ position: 'relative', mx: 2, height: '16px', textAlign: 'center' }}
    >
      <Divider
        sx={{
          my: 0,
          left: 0,
          right: 0,
          top: '50%',
          position: 'absolute',
          borderColor: 'divider'
        }}
      />
      <Typography
        variant="caption"
        color="text.hint"
        sx={{
          position: 'relative',
          bgcolor: 'background.paper',
          borderRadius: 2,
          top: -8,
          px: 1
        }}
      >
        {formattedDate}
      </Typography>
    </Box>
  )
}

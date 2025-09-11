import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { Box, IconButton, Stack } from '@mui/material'

const NavigationControls = ({
  prev,
  next,
  onClick
}: {
  prev: boolean
  next: boolean
  onClick?: (delta: number) => void
}) => {
  return (
    <Box sx={{ position: 'absolute', top: 10, left: 8 }}>
      <Stack spacing={0} direction="row">
        <IconButton
          size="large"
          disabled={!prev}
          sx={{ color: 'common.black' }}
          onClick={() => onClick?.(-1)}
        >
          <ArrowBackIosNewIcon sx={{ width: 20, height: 20 }} />
        </IconButton>
        <IconButton
          size="large"
          disabled={!next}
          sx={{ color: 'common.black' }}
          onClick={() => onClick?.(+1)}
        >
          <ArrowForwardIosIcon sx={{ width: 20, height: 20 }} />
        </IconButton>
      </Stack>
    </Box>
  )
}

export default NavigationControls

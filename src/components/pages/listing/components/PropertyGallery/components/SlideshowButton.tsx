import SmartDisplayOutlinedIcon from '@mui/icons-material/SmartDisplayOutlined'
import { Button, Stack } from '@mui/material'

import { verticalThumbHeight, verticalThumbWidth } from '../constants'

const SlideshowButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      color="primary"
      variant="contained"
      disableFocusRipple
      onClick={onClick}
      sx={{
        display: 'flex',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.light',
        width: verticalThumbWidth,
        height: verticalThumbHeight
      }}
    >
      <Stack
        spacing={1}
        alignItems="center"
        sx={{ position: 'relative', zIndex: 2 }}
      >
        <SmartDisplayOutlinedIcon sx={{ fontSize: 48 }} />
        Start Slideshow
      </Stack>
    </Button>
  )
}

export default SlideshowButton

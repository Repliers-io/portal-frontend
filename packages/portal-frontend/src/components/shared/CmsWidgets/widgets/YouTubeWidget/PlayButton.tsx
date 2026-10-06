import { Box, ButtonBase } from '@mui/material'

import { PlayArrowIcon } from '@configs/icons'

interface PlayButtonProps {
  onClick: () => void
}

export const PlayButton = ({ onClick }: PlayButtonProps) => {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        '&:hover .play-button': {
          transform: 'translate(-50%, -50%) scale(1.1)',
          bgcolor: 'error.main'
        }
      }}
    >
      <Box
        className="play-button"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 68,
          height: 48,
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, background-color 0.2s'
        }}
      >
        <PlayArrowIcon sx={{ color: 'common.white', fontSize: 40 }} />
      </Box>
    </ButtonBase>
  )
}

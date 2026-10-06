import { Box, IconButton, Stack } from '@mui/material'

import { NavigateBeforeIcon, NavigateNextIcon } from '@configs/icons'

// The header carries the browser's primary navigation, so its chevron runs larger
// than the same glyph elsewhere (gallery steps, multi-units bar). An IconButton is
// padding + icon, so the padding drops by the same amount the icon gains and the
// button keeps the 44px it had at `size="large"`'s default 12px padding.
const iconSize = 28
const buttonPadding = `${(44 - iconSize) / 2}px`

export const NavigationControls = ({
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
          sx={{ color: 'common.black', p: buttonPadding }}
          onClick={() => onClick?.(-1)}
        >
          <NavigateBeforeIcon sx={{ width: iconSize, height: iconSize }} />
        </IconButton>
        <IconButton
          size="large"
          disabled={!next}
          sx={{ color: 'common.black', p: buttonPadding }}
          onClick={() => onClick?.(+1)}
        >
          <NavigateNextIcon sx={{ width: iconSize, height: iconSize }} />
        </IconButton>
      </Stack>
    </Box>
  )
}

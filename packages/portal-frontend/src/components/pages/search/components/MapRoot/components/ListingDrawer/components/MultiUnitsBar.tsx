import { Box, IconButton, Stack, Typography } from '@mui/material'

import { NavigateBeforeIcon, NavigateNextIcon } from '@configs/icons'

export const MultiUnitsBar = ({
  current,
  total,
  onPrev,
  onNext
}: {
  current: number
  total: number
  onPrev: () => void
  onNext: () => void
}) => (
  <Box sx={{ p: 0.5, borderTop: 1, borderColor: 'divider' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <IconButton onClick={onPrev} size="small" color="primary">
        <NavigateBeforeIcon fontSize="small" />
      </IconButton>
      <Typography variant="h6">
        {current + 1} of {total} listings
      </Typography>
      <IconButton onClick={onNext} size="small" color="primary">
        <NavigateNextIcon fontSize="small" />
      </IconButton>
    </Stack>
  </Box>
)

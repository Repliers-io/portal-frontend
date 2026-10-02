import { Typography } from '@mui/material'

import { PhotoIcon } from '@configs/icons'

export const ThumbnailsCount = ({ value }: { value: number }) => {
  return (
    <Typography
      variant="caption"
      color="secondary"
      fontWeight={600}
      sx={{
        px: 1,
        py: 0.75,
        gap: 0.75,
        right: { xs: 24, sm: 40, md: 16 },
        bottom: { xs: 8, sm: 16 },
        boxShadow: 1,
        elevation: 3,
        display: 'flex',
        borderRadius: 1.5,
        position: 'absolute',
        alignItems: 'center',
        pointerEvents: 'none',
        bgcolor: 'background.default'
      }}
    >
      <PhotoIcon size={14} />
      {value}
    </Typography>
  )
}

import { IconButton, lighten, Stack, Typography } from '@mui/material'

import { secondary } from '@configs/colors'
import { CloseIcon } from '@configs/icons'

export const FeatureChip = ({
  label,
  onDelete
}: {
  label: string
  onDelete?: (value: string) => void
}) => {
  const handleDelete = (e: any) => {
    onDelete?.(label)
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <Stack
      spacing={0}
      direction="row"
      alignItems="center"
      sx={{
        pl: 1.5,
        minWidth: 20,
        flexShrink: 1,
        borderRadius: 6,
        overflow: 'hidden',
        bgcolor: lighten(secondary, 0.9)
      }}
    >
      <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
        {label}
      </Typography>
      <IconButton
        size="small"
        sx={{ color: 'common.black', flexShrink: 0 }}
        onClick={handleDelete}
      >
        <CloseIcon sx={{ width: 20, height: 20 }} />
      </IconButton>
    </Stack>
  )
}

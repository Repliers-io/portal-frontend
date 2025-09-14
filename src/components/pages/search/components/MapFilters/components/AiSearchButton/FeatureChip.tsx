import CloseIcon from '@mui/icons-material/Close'
import { IconButton, lighten, Stack, Typography } from '@mui/material'

import { secondary } from '@configs/colors'

const FeatureChip = ({
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
      spacing={0.5}
      direction="row"
      alignItems="center"
      sx={{
        pl: 2,
        borderRadius: 6,
        overflow: 'hidden',
        bgcolor: lighten(secondary, 0.9)
      }}
    >
      <Typography variant="body2" noWrap maxWidth={120}>
        {label}
      </Typography>
      <IconButton
        size="small"
        sx={{ color: 'common.black' }}
        onClick={handleDelete}
      >
        <CloseIcon sx={{ width: 20, height: 20 }} />
      </IconButton>
    </Stack>
  )
}

export default FeatureChip

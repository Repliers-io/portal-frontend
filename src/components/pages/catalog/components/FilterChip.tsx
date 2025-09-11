import CloseIcon from '@mui/icons-material/Close'
import { IconButton, Stack, Typography } from '@mui/material'

import { capitalize } from 'utils/strings'

const FilterChip = ({
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

  const formattedLabel = capitalize(label.replace('-', ' ')).replace(
    /(\d+(\.\d+)?)([km])/,
    (_, num, __, suffix) => `${num}${suffix.toUpperCase()}`
  )

  return (
    <Stack
      spacing={0.5}
      direction="row"
      alignItems="center"
      sx={{
        pl: 2,
        pr: 0,
        py: 0,
        borderRadius: 8,
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}
    >
      <Typography variant="body2">{formattedLabel}</Typography>
      <IconButton
        size="small"
        sx={{ color: 'common.black' }}
        onClick={handleDelete}
      >
        <CloseIcon sx={{ width: 18, height: 18 }} />
      </IconButton>
    </Stack>
  )
}

export default FilterChip

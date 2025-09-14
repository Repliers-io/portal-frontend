import { Chip, Stack } from '@mui/material'

import { type PropertyTag } from 'utils/properties'

const Tags = ({ tags }: { tags: PropertyTag[] }) => {
  if (!tags || !tags.length) return null

  return (
    <Stack
      spacing={1}
      alignItems="flex-start"
      sx={{ position: 'absolute', top: 16, left: 16 }}
    >
      {tags.map((tag, index) => {
        const bgcolor = tag.color ? `${tag.color}.main` : 'common.white'
        const color = tag.color ? 'common.white' : 'secondary.main'
        return (
          <Chip
            key={index}
            label={tag.label.toUpperCase()}
            variant="filled"
            sx={{
              '& .MuiChip-label': {
                px: 1
              },
              p: 0,
              height: 24,
              fontSize: 10,
              fontWeight: 500,
              borderRadius: 1,
              bgcolor,
              color
            }}
          />
        )
      })}
    </Stack>
  )
}

export default Tags

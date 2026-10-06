import { Box, Chip, lighten, Stack, Typography } from '@mui/material'

import { primary } from '@configs/colors'

type BlogChipProps = {
  label: string
  count?: number
  href: string
}

export const BlogChip = ({ label, count, href }: BlogChipProps) => {
  return (
    <Chip
      component="a"
      href={href}
      clickable
      label={
        count !== undefined ? (
          <Stack direction="row" spacing={1} alignItems="center">
            {label}
            <Box
              component="span"
              sx={{
                mr: -0.75,
                px: 0.25,
                height: 20,
                minWidth: 20,
                borderRadius: '10px',
                alignItems: 'center',
                display: 'inline-flex',
                boxSizing: 'border-box',
                justifyContent: 'center',
                bgcolor: 'background.default',
                transition: 'background-color 0.2s',

                '.MuiChip-root:hover &': {
                  bgcolor: 'background.paper'
                }
              }}
            >
              <Typography variant="caption" color="text.hint">
                {count}
              </Typography>
            </Box>
          </Stack>
        ) : (
          label
        )
      }
      sx={{
        cursor: 'pointer',
        position: 'relative',
        bgcolor: 'background.default',
        border: 'none',
        '&:hover': {
          bgcolor: lighten(primary, 0.85)
        }
      }}
    />
  )
}

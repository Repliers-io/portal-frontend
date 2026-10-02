import type { ReactNode } from 'react'

import { type SxProps, type Theme } from '@mui/material'
import { Box, Divider, Stack, Typography } from '@mui/material'

export const ListingSection = ({
  id,
  title,
  subtitle,
  contentSx,
  children
}: {
  id: string
  title: string
  subtitle?: string
  contentSx?: SxProps<Theme>
  children: ReactNode
}) => (
  <Stack id={id} component="section" spacing={3}>
    <Divider sx={{ borderColor: 'divider', m: 0 }} />

    <Stack spacing={1.5}>
      <Typography variant="h4" component="h2">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      )}
    </Stack>

    <Box sx={{ ...contentSx }}>{children}</Box>
  </Stack>
)

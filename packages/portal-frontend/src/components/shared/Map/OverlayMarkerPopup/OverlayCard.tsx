import type { ReactNode } from 'react'

import { Box, lighten, Paper } from '@mui/material'

/**
 * Shared surface for the default-tenant overlay tooltip cards: a listing-card-like
 * Paper (rounded corners + shadow) with a 4px accent strip down the left edge
 * (the overlay colour, lightened by half) instead of a coloured border. Movesmartly
 * cards have their own surfaces (in `_movesmartly-com/`) and are unaffected.
 */
export const OverlayCard = ({
  accentColor,
  maxWidth,
  children
}: {
  accentColor: string
  maxWidth?: number
  children: ReactNode
}) => (
  <Paper
    elevation={0}
    sx={{
      display: 'flex',
      overflow: 'hidden',
      borderRadius: 2,
      boxShadow: 1,
      ...(maxWidth ? { maxWidth } : {})
    }}
  >
    <Box
      sx={{
        width: 4,
        flexShrink: 0,
        bgcolor: lighten(accentColor, 0.4)
      }}
    />
    <Box sx={{ p: 1.5, minWidth: 0 }}>{children}</Box>
  </Paper>
)

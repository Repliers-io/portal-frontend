import type React from 'react'

import { Stack, Typography } from '@mui/material'

const SalesIntentions = ({ sellingTimeline }: { sellingTimeline?: string }) => {
  // const sellingTimeline = payload?.data?.salesIntentions?.sellingTimeline

  if (!sellingTimeline) return null

  return (
    <Stack direction="column" gap={1}>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Typography variant="body1" color="text.secondary">
          Intends to sell:
        </Typography>
        <Typography variant="body1">{sellingTimeline}</Typography>
      </Stack>
    </Stack>
  )
}

export default SalesIntentions

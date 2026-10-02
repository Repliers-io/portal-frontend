import { Paper } from '@mui/material'

import { WidgetTitle } from './WidgetTitle'

export const WidgetSkeleton = () => {
  return (
    <Paper
      sx={{
        width: '100%',
        height: '100%'
      }}
    >
      <WidgetTitle loading />
    </Paper>
  )
}

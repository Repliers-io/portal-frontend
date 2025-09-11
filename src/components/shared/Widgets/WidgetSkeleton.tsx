import { Paper } from '@mui/material'

import WidgetTitle from './WidgetTitle'

const WidgetSkeleton = () => {
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

export default WidgetSkeleton

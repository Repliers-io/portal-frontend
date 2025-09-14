import { Skeleton } from '@mui/material'

const WidgetSkeleton = () => {
  return (
    <Skeleton
      variant="rounded"
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '188px'
      }}
    />
  )
}

export default WidgetSkeleton

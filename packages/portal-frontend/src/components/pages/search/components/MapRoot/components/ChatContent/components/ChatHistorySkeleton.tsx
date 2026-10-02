import { Box, CircularProgress, Skeleton } from '@mui/material'

export const ChatHistorySkeleton = () => {
  return (
    <Box sx={{ position: 'relative' }}>
      <CircularProgress
        size={16}
        sx={{ mx: 1, position: 'absolute', top: 8, left: 16 }}
      />
      <Skeleton
        variant="rounded"
        width="40%"
        height="38px"
        sx={{ float: 'right', mx: 2, mt: 1, borderRadius: 2 }}
      />
      <Skeleton
        variant="rounded"
        width="75%"
        height="58px"
        sx={{ float: 'left', mx: 2, mt: 1, borderRadius: 2 }}
      />
      <Skeleton
        variant="rounded"
        width="65%"
        height="38px"
        sx={{ float: 'right', mx: 2, mt: 1, borderRadius: 2 }}
      />
      <Skeleton
        variant="rounded"
        width="50%"
        height="38px"
        sx={{ float: 'left', mx: 2, mt: 1, borderRadius: 2 }}
      />
      <Skeleton
        variant="rounded"
        width="55%"
        height="38px"
        sx={{ float: 'right', mx: 2, mt: 1, borderRadius: 2 }}
      />
      <Skeleton
        variant="rounded"
        width="68%"
        height="58px"
        sx={{ float: 'left', mx: 2, mt: 1, borderRadius: 2 }}
      />
    </Box>
  )
}

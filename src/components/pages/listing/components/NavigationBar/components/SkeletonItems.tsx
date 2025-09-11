import { Skeleton, Stack } from '@mui/material'

const SkeletonItems = () => {
  return (
    <Stack spacing={6} direction="row" justifyContent="center" py={1}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} variant="text" width="100px" />
      ))}
    </Stack>
  )
}

export default SkeletonItems

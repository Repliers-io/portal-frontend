import { Skeleton, Stack } from '@mui/material'

export const SkeletonItems = () => {
  return (
    <Stack spacing={6} direction="row" justifyContent="center" py={1}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} variant="text" width="100px" />
      ))}
    </Stack>
  )
}

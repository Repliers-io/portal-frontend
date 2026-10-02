import { Skeleton, Stack } from '@mui/material'

export const FiltersSkeleton = () => (
  <>
    <Skeleton variant="rounded" sx={{ width: 100, height: 24, mr: '118px' }} />
    <Stack spacing={1.5} direction="row">
      <Skeleton variant="rounded" sx={{ width: 154, height: 46 }} />
      <Skeleton variant="rounded" sx={{ width: 253, height: 46 }} />
    </Stack>
    <Skeleton variant="rounded" sx={{ width: 180, height: 28, ml: '69px' }} />
  </>
)

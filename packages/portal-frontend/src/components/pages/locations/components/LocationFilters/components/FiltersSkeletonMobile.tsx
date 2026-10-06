import { Skeleton, Stack } from '@mui/material'

export const FiltersSkeletonMobile = ({ maxWidth }: { maxWidth: number }) => (
  <Stack spacing={1} sx={{ maxWidth, width: '100%' }}>
    <Stack direction="row" justifyContent="center" spacing={1.5}>
      <Skeleton
        variant="rounded"
        sx={{ width: 148, height: { xs: 40, sm: 46 } }}
      />
      <Skeleton
        variant="rounded"
        sx={{
          flex: { xs: 1, sm: 'none' },
          width: { xs: 'auto', sm: 220 },
          height: { xs: 40, sm: 46 }
        }}
      />
    </Stack>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Skeleton variant="rounded" sx={{ width: 100, height: 24 }} />
      <Skeleton variant="rounded" sx={{ width: 180, height: 28 }} />
    </Stack>
  </Stack>
)

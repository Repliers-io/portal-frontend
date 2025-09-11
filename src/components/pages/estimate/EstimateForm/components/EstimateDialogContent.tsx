import React from 'react'

import { Stack } from '@mui/material'

import { estimateFormMinHeight } from '@configs/estimate'

const EstimateDialogContent = ({
  autoHeight,
  children
}: {
  autoHeight: boolean
  children: React.ReactNode
}) => {
  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      width="100%"
      sx={{
        flex: 1,
        maxHeight: autoHeight
          ? 'auto'
          : {
              xs: 'calc(100svh - 102px)',
              sm: 'calc(100svh - 80px - 72px)',
              // 80px is form internal paddings, 64 (48+24) is footer/ActionBar height
              md: `min(calc(100svh - 112px - 96px), ${estimateFormMinHeight}px)`
              // 112px is form internal paddings, 96 (80+16) is footer/ActionBar height
            }
      }}
    >
      {children}
    </Stack>
  )
}
export default EstimateDialogContent

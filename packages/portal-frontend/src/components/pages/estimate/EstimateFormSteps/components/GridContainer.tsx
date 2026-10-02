import type { ReactNode } from 'react'

import { Stack, type StackProps } from '@mui/material'

const GridContainer = ({
  sx = {},
  children
}: {
  sx?: StackProps['sx']
  children: ReactNode
}) => {
  return (
    <Stack
      sx={{
        width: '100%',
        '& > *:last-child': { mb: 0, pb: 0, border: 0 },
        ...sx
      }}
    >
      {children}
    </Stack>
  )
}
export default GridContainer

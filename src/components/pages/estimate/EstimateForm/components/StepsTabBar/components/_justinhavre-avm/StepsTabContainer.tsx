import React, { useMemo } from 'react'

import { Box, Stack } from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'

const StepsTabContainer = ({
  index,
  active = false,
  available = true,
  onClick,
  children
}: {
  index: number
  active?: boolean
  available?: boolean
  onClick?: () => void
  children: React.ReactNode
}) => {
  const { desktop } = useBreakpoints()
  const borderColor =
    active && available
      ? 'primary.main'
      : available
        ? 'primary.dark'
        : 'divider'

  const sx = useMemo(
    () =>
      desktop
        ? {}
        : {
            border: 0,
            width: '100%',
            borderRadius: 0,
            marginLeft: '-16px',
            background: 'transparent'
          },
    [desktop]
  )

  return (
    <Box
      id={`estimate-step-${index}`}
      sx={{
        p: 3,
        border: 1,
        borderRadius: 2,
        position: 'relative',
        borderColor: borderColor,
        bgcolor: 'background.paper',
        cursor: available ? 'pointer' : 'not-allowed',
        ...sx
      }}
      onClick={() => (available ? onClick?.() : undefined)}
    >
      <Stack spacing={2} direction="row" alignItems="center">
        {children}
      </Stack>
    </Box>
  )
}

export default StepsTabContainer

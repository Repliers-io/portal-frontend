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
  const borderColor = active && available ? 'primary.main' : 'divider'

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
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: available ? 'pointer' : 'not-allowed',
        ...sx,

        '&:after': {
          content: '""',
          top: -1,
          left: -1,
          zIndex: 2,
          bottom: -1,
          width: '8px',
          position: 'absolute',
          bgcolor: borderColor,
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px'
        }
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

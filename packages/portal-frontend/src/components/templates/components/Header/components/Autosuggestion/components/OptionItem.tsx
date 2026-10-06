import React from 'react'

import { Box } from '@mui/material'

import { toRem } from 'utils/theme'

export const OptionItem = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLLIElement> & {
  children: React.ReactNode
}) => (
  <li {...props}>
    <Box
      sx={{
        p: 1,
        py: 1.5,
        width: '100%',
        borderRadius: 2,
        fontSize: toRem(14),
        bgcolor: 'background.default',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }}
    >
      {children}
    </Box>
  </li>
)

import React from 'react'

import { Box, Stack, type StackProps, Typography } from '@mui/material'

interface ChartBulletListProps extends StackProps {
  labels: string[]
  colors: string[]
  direction?: 'column' | 'row'
  spacing?: number
}

export const ChartBulletList: React.FC<ChartBulletListProps> = ({
  labels,
  colors,
  direction = 'row',
  spacing = 2,
  ...rest
}) => {
  return (
    <Stack spacing={spacing} direction={direction} {...rest}>
      {labels.map((label, index) => (
        <Stack key={index} direction="row" spacing={1}>
          <Box
            sx={{
              my: '4px',
              height: '12px',
              width: '12px',
              minWidth: '12px',
              borderRadius: '50%',
              bgcolor: colors[index]
            }}
          />
          <Typography
            variant="body2"
            sx={{ lineHeight: '20px' /* same as bullet height */ }}
          >
            {label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

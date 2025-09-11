import React from 'react'

import { Box, Paper, Stack, Typography } from '@mui/material'

import { primary, secondary } from '@configs/colors'
import IcoDollar from '@icons/IcoDollar'

import { formatPercentage } from 'utils/formatters'

interface ChangeItemProps {
  value: number | false
  title: string
  color?: 'primary' | 'secondary'
}
const PriceTrend = ({ title, value, color = 'primary' }: ChangeItemProps) => {
  const dividerColor = color === 'primary' ? primary : secondary
  const currencyColor = color === 'primary' ? secondary : primary

  return (
    <Paper
      sx={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        boxSizing: 'border-box',
        alignItems: 'center',
        height: 96,

        '&::before': {
          content: '""',
          position: 'absolute',
          width: '8px',
          height: '100%',
          top: 0,
          bottom: 0,
          left: 0,
          m: 0,
          bgcolor: dividerColor
        }
      }}
    >
      <Stack
        spacing={1}
        direction="row"
        alignItems="stretch"
        width="100%"
        py={2}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={2.5}
          flex="1"
          pl={3.5}
          py={2}
        >
          <IcoDollar color={currencyColor} />
          <Typography variant="h4">{title}</Typography>
        </Box>
        <Box
          pl={{ xs: 1, md: 2 }}
          pr={{ xs: 2, md: 4 }}
          boxSizing="border-box"
          justifyContent="flex-end"
          display="flex"
          alignItems="center"
        >
          {value !== false ? (
            <Typography variant="h2">
              {formatPercentage(value.toFixed(1))}
            </Typography>
          ) : (
            <Typography variant="h2">No data</Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

export default PriceTrend

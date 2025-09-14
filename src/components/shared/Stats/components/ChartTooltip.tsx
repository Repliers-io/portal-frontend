import dayjs from 'dayjs'
import type React from 'react'

import { Paper, Stack, Typography } from '@mui/material'

import ChartTooltipItem from './ChartTooltipItem'

export const ChartTooltip = ({ active, payload, label, labels }: any) => {
  if (!active || !payload || !payload.length) return null

  const labelKeys = Object.keys(labels || {})
  const sortedPayload = [...payload].sort((a, b) => {
    const indexA = labelKeys.indexOf(a.name)
    const indexB = labelKeys.indexOf(b.name)

    // If item not found in labels, put it at the end
    return (
      (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    )
  })

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        pb: 1.5,
        border: 1,
        borderRadius: 2,
        borderColor: 'divider'
      }}
    >
      <Typography
        variant="h4"
        sx={{
          pb: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        {dayjs(label).format('MMM YYYY')}
      </Typography>

      <Stack spacing={0.5} pt={1}>
        {sortedPayload.map((item: any) => (
          <ChartTooltipItem
            key={item.name}
            value={
              labels[item.name]?.formatter
                ? labels[item.name]?.formatter(item.value)
                : item.value
            }
            color={labels[item.name]?.color}
            label={labels[item.name]?.label}
          />
        ))}
      </Stack>
    </Paper>
  )
}

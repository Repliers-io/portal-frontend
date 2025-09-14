import React from 'react'

import { Box, Divider, Stack, Typography } from '@mui/material'

import { formatEnglishPrice } from 'utils/formatters'

import Widget, { type WidgetProps } from './Widget'

export const labels = ['High', 'Low', 'Average', 'Median']

const highlight = 2

type StatsWidgetProps = WidgetProps & {
  data: { min: number; max: number; avg: number; med: number }
}

const StatsWidget = ({ data, ...props }: StatsWidgetProps) => {
  const { max, min, avg, med } = data
  const items = [max, min, avg, med]

  return (
    <Box sx={{ width: '100%', maxWidth: 610 }}>
      <Widget {...props} loading={!data}>
        {data && (
          <Stack
            useFlexGap
            spacing={{ xs: 2, sm: 1 }}
            width="100%"
            flexWrap="wrap"
            direction="row"
            alignItems="stretch"
            justifyContent="space-around"
            divider={<Divider orientation="vertical" flexItem />}
            sx={{
              '& .MuiDivider-root:nth-of-type(2)': {
                display: { xs: 'none', md: 'block' }
              }
            }}
          >
            {items.map((item, i) => (
              <Stack
                key={`${i}-${item}`}
                justifyContent="space-between"
                height="100%"
                sx={{ minWidth: { xs: '40%', sm: '20%' }, flex: 1 }}
              >
                <Box>{labels[i]}</Box>
                <Box pt={1.5}>
                  <Typography
                    color={i === highlight ? 'red.main' : 'primary.main'}
                    variant="h5"
                    fontWeight="600"
                    fontSize="1.25rem"
                    lineHeight="1.5"
                  >
                    {formatEnglishPrice(item)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Widget>
    </Box>
  )
}

export default StatsWidget

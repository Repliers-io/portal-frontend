import React from 'react'

import { Box, Divider, Stack, Typography } from '@mui/material'

import { formatLongNumber } from 'utils/formatters'

import Widget, { type WidgetProps } from './Widget'

export const labels = ['This month', 'Last 3 months', 'Last year']

type ArrayWidgetProps = WidgetProps & {
  data?: number[] | false
  formatter?: (value: number, precision: number) => string
}

const ArrayWidget = ({
  data,
  formatter = formatLongNumber,
  ...props
}: ArrayWidgetProps) => {
  return (
    <Widget {...props} loading={!data}>
      {data && (
        <Stack
          spacing={1}
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          justifyContent="space-around"
          alignItems="stretch"
          width="100%"
        >
          {data.map((item, index) => {
            if (!labels[index]) return null
            return (
              <Stack
                key={`${item}-${index}`}
                justifyContent="space-between"
                height="100%"
              >
                <Typography variant="body2">{labels[index]}</Typography>
                <Box pt={1.5}>
                  <Typography variant="h4">{formatter(item, 1)}</Typography>
                </Box>
              </Stack>
            )
          })}
        </Stack>
      )}
    </Widget>
  )
}

export default ArrayWidget

import React from 'react'

import { Typography } from '@mui/material'

import { formatEnglishNumber } from 'utils/formatters'

import { Widget, type WidgetProps } from './Widget'

type CountWidgetProps = WidgetProps & {
  formatter?: (value: number) => string
  data?: number | false
}

const CountWidget = ({
  data,
  formatter = formatEnglishNumber,
  ...props
}: CountWidgetProps) => {
  return (
    <Widget {...props} loading={typeof data !== 'number' && !props.error}>
      {typeof data === 'number' && (
        <Typography
          variant="h5"
          fontWeight="600"
          fontSize="3.5rem"
          lineHeight="1"
          pt={1}
        >
          {formatter(data)}
        </Typography>
      )}
    </Widget>
  )
}

export default CountWidget

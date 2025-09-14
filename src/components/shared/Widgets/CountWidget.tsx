import { Typography } from '@mui/material'

import { toSafeNumber } from 'utils/formatters'

import Widget, { type WidgetProps } from './Widget'

type CountWidgetProps = WidgetProps & {
  data?: number | false
}

const CountWidget = ({ data, ...props }: CountWidgetProps) => {
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
          {toSafeNumber(data)}
        </Typography>
      )}
    </Widget>
  )
}

export default CountWidget

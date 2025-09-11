import { useReducer } from 'react'

import { Stack } from '@mui/material'

import { ChartBulletList } from '@shared/Stats'

import { labels } from '../ArrayWidget'
import Widget, { type WidgetProps } from '../Widget'

import BarsList, { type BarsType } from './BarsList'

const colors = ['secondary.main', 'primary.light', 'success.main']

type BarsWidgetProps = WidgetProps & {
  data?: BarsType[]
}

const BarsWidget = ({ data, ...props }: BarsWidgetProps) => {
  const [visible, toggleVisibility] = useReducer((value) => !value, false)
  const barTypeLabels = ['Average', 'Median']

  return (
    <Widget {...props} loading={!data} index={0} onVisible={toggleVisibility}>
      {data && (
        <Stack spacing={2} justifyContent="space-evenly" sx={{ width: '100%' }}>
          <ChartBulletList labels={barTypeLabels} colors={colors} />
          <BarsList
            labels={labels}
            colors={colors}
            data={data}
            visible={visible}
          />
        </Stack>
      )}
    </Widget>
  )
}

export default BarsWidget

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { Box } from '@mui/material'

import useIntersectionObserver from 'hooks/useIntersectionObserver'
import useResponsiveValue from 'hooks/useResponsiveValue'

import { chartData } from './constants'
import { ArrowNeedle, InventoryTimeline } from '.'

const InventoryChart = ({ value = 5 }: { value: number }) => {
  const [visible, ref] = useIntersectionObserver(0.5)

  const chartWidth = useResponsiveValue({ xs: 294, sm: 280, lg: 340 }) || 340
  const chartHeight = chartWidth / 2
  const outerRadius = chartHeight - 2
  const innerRadius = outerRadius - 10

  const segments = chartData.length
  // eslint-disable-next-line no-param-reassign
  value = Math.max(Math.min(segments, value), 0) // prevent overflow
  const rotation = (value / segments) * 180 // degrees
  const animate = true

  return (
    <Box
      ref={ref}
      sx={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        minHeight: chartHeight,
        mx: 'auto',
        mb: 2 // needle center point stretches above the chart for 16px
      }}
    >
      <Box
        sx={{
          width: chartWidth,
          height: chartHeight,
          position: 'absolute',
          transform: 'translate(-50%, 0)'
        }}
      >
        {visible && <ArrowNeedle rotation={rotation} animate={animate} />}

        <InventoryTimeline value={value} visible={visible} animate={animate} />

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              data={chartData}
              paddingAngle={2}
              startAngle={180}
              endAngle={0}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              isAnimationActive={false}
              stroke="none"
              cy={chartHeight - 6}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

export default InventoryChart

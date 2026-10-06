'use client'

import { Pie, PieChart, ResponsiveContainer } from 'recharts'

import { Box, Stack, Typography } from '@mui/material'

import { demographicsPalette } from '@configs/colors'

import useIntersectionObserver from 'hooks/useIntersectionObserver'

import type { Population } from '../types'

const formatPercentage = (percentage: number) =>
  percentage > 0 && percentage < 1 ? '<1%' : `${Math.round(percentage)}%`

const AgeChartLegend = ({
  data,
  visible
}: {
  data: Population[]
  visible: boolean
}) => {
  const half = Math.ceil(data.length / 2)
  const left = data.slice(0, half)
  const right = data.slice(half)

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 4 }}
      sx={{
        flex: 1,
        justifyContent: { xs: 'center', sm: 'flex-start' }
      }}
    >
      {[left, right].map((column, colIndex) => (
        <Stack key={colIndex} spacing={1.5}>
          {column.map((group, i) => {
            const globalIndex = colIndex * half + i
            const color =
              group.color ??
              demographicsPalette[globalIndex % demographicsPalette.length]
            return (
              <Stack
                key={group.label}
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-8px)',
                  transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                  transitionDelay: visible ? `${globalIndex * 100}ms` : '0ms'
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: color,
                    borderRadius: 0.5,
                    flexShrink: 0,
                    mt: '-1px'
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{ width: 28, flexShrink: 0 }}
                >
                  {formatPercentage(group.percentage)}
                </Typography>
                <Typography variant="body2">{group.label}</Typography>
              </Stack>
            )
          })}
        </Stack>
      ))}
    </Stack>
  )
}

export const PopulationDonut = ({
  data,
  hideZero = false,
  sortByPercentage = false
}: {
  data: Population[]
  hideZero?: boolean
  sortByPercentage?: boolean
}) => {
  const [visible, ref] = useIntersectionObserver(0.7)
  const filtered = hideZero
    ? data.filter(({ percentage }) => percentage > 0)
    : data
  const visibleData = sortByPercentage
    ? [...filtered].sort((a, b) => b.percentage - a.percentage)
    : filtered

  const chartSize = 122 // figma design size
  const outerRadius = chartSize / 2 // max radius size, avoid overflow container
  const innerRadius = outerRadius * 0.5 // standard donut ratio

  return (
    <Stack
      ref={ref}
      direction="row"
      spacing={{ xs: 5, sm: 8 }}
      alignItems="center"
      sx={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease-out'
      }}
    >
      {/* decorative chart — disable hover/focus interaction */}
      <Box
        sx={{
          width: chartSize,
          height: chartSize,
          flexShrink: 0,
          pointerEvents: 'none'
        }}
      >
        {visible && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="percentage"
                data={visibleData.map((d, i) => ({
                  ...d,
                  fill:
                    d.color ??
                    demographicsPalette[i % demographicsPalette.length]
                }))}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={0}
                startAngle={90} // start from 12 o'clock (top)
                endAngle={-270} // full circle clockwise (90 - 360 = -270), negative = clockwise direction
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
                stroke="none"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>

      <AgeChartLegend data={visibleData} visible={visible} />
    </Stack>
  )
}

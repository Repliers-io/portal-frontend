import { Box, Typography } from '@mui/material'

import PriceBar from './PriceBar'

export type BarsType = {
  avg: number
  med: number
}

const calcPercentage = (value: number, maxValue: number) =>
  `${(value / maxValue) * 100}%`

type BarsListProps = {
  data: BarsType[]
  labels: string[]
  colors: string[]
  visible: boolean
}

const BarsList = ({ data, labels, colors, visible }: BarsListProps) => {
  const max =
    (data &&
      data
        .filter((item) => item.avg > 0)
        .reduce((acc, item) => Math.max(acc, item.med, item.avg), 0)) ||
    0

  const widths =
    (data &&
      data.map((item) => ({
        medWidth: calcPercentage(item.med, max),
        avgWidth: calcPercentage(item.avg, max)
      }))) ||
    []

  return (
    <>
      {data.map(({ avg, med }, index) => {
        if (!labels[index]) return null
        const { medWidth, avgWidth } = widths[index]
        return (
          <Box key={`${labels[index]}`}>
            <Typography
              // color="secondary.main"
              variant="body2"
              fontWeight="normal"
            >
              {labels[index]}
            </Typography>
            <Box pr={12}>
              <PriceBar
                value={avg}
                width={avgWidth}
                color={colors[0]}
                visible={visible}
                index={index * 2}
              />
              <PriceBar
                value={med}
                width={medWidth}
                color={colors[1]}
                visible={visible}
                index={index * 2 + 1}
              />
            </Box>
          </Box>
        )
      })}
    </>
  )
}

export default BarsList

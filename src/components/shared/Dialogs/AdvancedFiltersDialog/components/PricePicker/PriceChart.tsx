import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Box } from '@mui/material'

import useWindowSize from 'hooks/useWindowSize'

const PriceChart = ({
  min,
  max,
  height = 60,
  buckets
}: {
  min: number
  max: number
  height?: number
  buckets: { [key: string]: number }
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<{ key: string; value: number }[]>([])

  const bucketsCount = Object.keys(buckets).length

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [width, setWidth] = useState(0)
  const graphContainerEl = useRef<HTMLDivElement>(null)
  const size = useWindowSize()

  useEffect(() => {
    const bucketEntries = Object.entries(buckets)
    if (bucketEntries.length) {
      setData(Object.entries(buckets).map(([key, value]) => ({ key, value })))
    }
  }, [buckets])

  useLayoutEffect(() => {
    if (graphContainerEl.current) {
      setWidth(graphContainerEl.current.clientWidth)
    }
  }, [size.width])

  // const chartSeries = {
  //   dataKey: 'value',
  //   area: true,
  //   showMark: false,
  //   connectNulls: true,
  //   color: '#ec6932'
  // }

  // const bgChartSeries = { ...chartSeries, color: '#CCCCCC' }

  // const chartParams = {
  //   width,
  //   height,
  //   dataset: data,
  //   leftAxis: null,
  //   bottomAxis: null,
  //   // skipAnimation: true,
  //   series: [chartSeries],
  //   sx: { pointerEvents: 'none' },
  //   margin: { bottom: 0, left: 0, right: 0, top: 1 }
  // }

  const frameOffset = (min / (bucketsCount - 1)) * 100
  const frameWidth = (max / (bucketsCount - 1)) * 100

  return (
    <Box
      ref={graphContainerEl}
      sx={{
        overflow: 'hidden',
        position: 'relative',
        '& svg g': {
          clipPath:
            'none !important' /* MUI has weird boundaries, clipping part of our graph */
        }
      }}
    >
      {/* <LineChart {...chartParams} series={[bgChartSeries]} /> */}

      <Box
        sx={{
          top: 0,
          height,
          left: `${frameOffset}%`,
          overflow: 'hidden',
          position: 'absolute'
        }}
      >
        <Box
          sx={{
            overflow: 'hidden',
            marginLeft: `${frameOffset * -1}%`,
            width: `${frameWidth}%`
          }}
        >
          {/* <LineChart {...chartParams} /> */}
        </Box>
      </Box>
    </Box>
  )
}

export default PriceChart

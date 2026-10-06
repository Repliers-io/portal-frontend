import React, { useEffect, useState } from 'react'

import { Box, Stack } from '@mui/material'

const PriceBars = ({
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
  const [data, setData] = useState<{ key: string; value: number }[]>([])
  const [bucketsMaxValue, setBucketsMaxValue] = useState(10000)

  useEffect(() => {
    const bucketEntries = Object.entries(buckets)
    if (bucketEntries.length) {
      setData(Object.entries(buckets).map(([key, value]) => ({ key, value })))
      setBucketsMaxValue(Math.max(...Object.values(buckets)))
    }
  }, [buckets])

  return (
    <Stack
      direction="row"
      alignItems="flex-end"
      justifyContent="space-around"
      spacing="2px"
      sx={{ width: '100%', height }}
    >
      {data.slice(0, -1).map(({ key, value }, index) => (
        <Box
          key={key}
          sx={{
            flex: 1,
            // Bars thin out as the bucket count grows instead of overflowing the
            // row; 14px stays the widest they get, so a short histogram is unchanged.
            maxWidth: '14px',
            borderRadius: '2px 2px 0 0',
            transition: 'height 0.2s ease',
            height: (value / bucketsMaxValue) * height,
            bgcolor: index >= min && index < max ? 'primary.light' : 'divider'
          }}
        />
      ))}
    </Stack>
  )
}

export default PriceBars

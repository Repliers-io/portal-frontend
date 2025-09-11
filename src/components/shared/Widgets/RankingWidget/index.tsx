import React, { useReducer, useState } from 'react'

import { Box, Button, MenuItem, Stack } from '@mui/material'

import Select from 'components/atoms/PatchedSelect'

import { type NeighborhoodsRankingSorting } from 'services/API'

import { labels } from '../ArrayWidget'
import Widget, { type WidgetProps } from '../Widget'

import NeighbourhoodRank from './NeighbourhoodRank'

type TrendsWidgetProps = WidgetProps & {
  data?: {
    [key: string]: {
      name: string
      value: number
      avgCurrent: number
      avgPrevious: number
    }[]
  }
  limit?: number
  sort: NeighborhoodsRankingSorting
  onSortChange: (sort: NeighborhoodsRankingSorting) => void
  mode?: 'standard' | 'modal'
  onShowAll?: () => void
}

const RankingWidget = ({
  data,
  limit = 8,
  sort,
  onSortChange,
  onShowAll,
  mode = 'standard',
  ...props
}: TrendsWidgetProps) => {
  const [visible, toggleVisibility] = useReducer((value) => !value, false)
  const [currentTimeRange, setCurrentTimeRange] = useState(1)

  const ranges = (data && Object.keys(data).map((key) => data[key])) || [
    [],
    [],
    []
  ]
  const range = ranges[currentTimeRange]

  const handleTimeRangeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const index = labels.indexOf(event.currentTarget.textContent || '')
    setCurrentTimeRange(index)
    // voodoo magic to refresh the list of trending neighbourhoods with animation
    toggleVisibility()
    setTimeout(toggleVisibility, 0)
  }

  return (
    <Widget {...props} loading={!data} index={0} onVisible={toggleVisibility}>
      {data && (
        <Stack
          spacing={3}
          sx={{ height: '100%', width: '100%' }}
          justifyContent="space-around"
          flexDirection={mode === 'standard' ? 'column' : 'column-reverse'}
        >
          <Stack>
            {range.map(
              ({ name, value, avgCurrent, avgPrevious }, index) =>
                index < limit && (
                  <NeighbourhoodRank
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${name}-${value}-${index}`}
                    title={name}
                    value={value}
                    index={index}
                    visible={visible}
                    avgCurrent={avgCurrent}
                    avgPrevious={avgPrevious}
                  />
                )
            )}
          </Stack>
          <Stack
            direction={mode === 'standard' ? 'column' : 'row'}
            gap={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Box sx={{ width: mode === 'standard' ? '100%' : 200 }}>
              <Select
                fullWidth
                value={sort}
                onChange={(e) =>
                  onSortChange(e.target?.value as NeighborhoodsRankingSorting)
                }
              >
                <MenuItem value="gainHighToLow">% Gain - High to Low</MenuItem>
                <MenuItem value="gainLowToHigh">% Loss - Low to High</MenuItem>
                <MenuItem value="avgHighToLow">
                  Average Price - High to Low
                </MenuItem>
                <MenuItem value="avgLowToHigh">
                  Average Price - Low to High
                </MenuItem>
              </Select>
            </Box>
            {mode === 'standard' && (
              <Box textAlign="center">
                <Button variant="outlined" onClick={() => onShowAll?.()}>
                  All neighbourhoods
                </Button>
              </Box>
            )}
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              flexWrap="wrap"
            >
              {labels.map((title, index) => (
                <Button
                  key={title}
                  variant="contained"
                  color={index === currentTimeRange ? 'secondary' : 'primary'}
                  onClick={handleTimeRangeClick}
                >
                  {title}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Stack>
      )}
    </Widget>
  )
}

export default RankingWidget

import React, { useCallback, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'

import { Box, Slider } from '@mui/material'

import dayOfYear from 'dayjs/plugin/dayOfYear'

import { useMapOptions } from 'providers/MapOptionsProvider'

import { CalendarThumb, MicroMonth } from './components'

dayjs.extend(dayOfYear)

const debounce = 200
const sliderWidth = 182 + 36 // Extra space for thumb

type CalendarSliderProps = {
  currentDate: Date
  onChange?: (date: Date) => void
}

export const CalendarSlider = ({
  currentDate,
  onChange
}: CalendarSliderProps) => {
  const { shadows } = useMapOptions()
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  const { initialValue, daysInYear, year } = useMemo(() => {
    const date = dayjs(currentDate)
    return {
      year: date.year(),
      initialValue: date.dayOfYear(),
      daysInYear: date.endOf('year').dayOfYear()
    }
  }, [currentDate])

  const [value, setValue] = useState(initialValue)

  const fireChange = useCallback(
    (newVal: number) => {
      const newDate = dayjs(currentDate).dayOfYear(newVal).toDate()
      onChange?.(newDate)
    },
    [currentDate, onChange]
  )

  const handleChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      const newVal = newValue as number
      setValue(newVal)

      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => fireChange(newVal), debounce)
    },
    [fireChange]
  )

  const handleChangeCommitted = useCallback(
    (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)

      fireChange(newValue as number)
    },
    [fireChange]
  )

  return (
    <Box
      sx={{
        my: 0.5,
        p: 0.75,
        px: 2,
        height: 28,
        width: sliderWidth,
        boxShadow: 1,
        display: 'flex',
        borderRadius: 5,
        bgcolor: '#ddd',
        fontWeight: 'bold',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        opacity: shadows ? 1 : 0,
        transition: 'opacity 0.15s linear',
        pointerEvents: shadows ? 'auto' : 'none',
        border: 2,
        borderColor: '#FFFC'
      }}
    >
      {/* Micro months background */}
      <Box
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          px: 0.75,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <MicroMonth key={i} month={i} year={year} />
        ))}
      </Box>

      <Slider
        slots={{ thumb: CalendarThumb }}
        slotProps={{
          thumb: {
            sliderValue: value
          } as React.HTMLAttributes<HTMLSpanElement>
        }}
        value={value}
        step={1}
        min={1}
        max={daysInYear}
        valueLabelDisplay="off"
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        sx={{
          width: '100%',

          '& .MuiSlider-thumb': {
            p: 0,
            mt: -2,
            ml: -2.25,
            width: 36,
            height: 36,
            padding: 0,
            border: 2,
            borderRadius: 1.5,
            position: 'absolute',
            boxSizing: 'border-box',
            borderColor: '#333',
            bgcolor: '#FFF',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            '&:hover, &.Mui-active': {
              borderColor: '#000',
              boxShadow: '0 0 0 6px #FFF4'
            }
          },

          '& .MuiSlider-track': {
            display: 'none'
          },
          '& .MuiSlider-rail': {
            display: 'none'
          }
        }}
      />
    </Box>
  )
}

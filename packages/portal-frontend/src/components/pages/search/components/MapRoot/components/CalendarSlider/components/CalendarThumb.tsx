import React, { forwardRef, useMemo } from 'react'
import dayjs from 'dayjs'

import { darken, useTheme } from '@mui/material'

import { error } from '@configs/colors'

import dayOfYear from 'dayjs/plugin/dayOfYear'

dayjs.extend(dayOfYear)

// North American holidays (month-day format)
const holidays = [
  { month: 1, day: 1 }, // New Year's Day
  { month: 7, day: 1 }, // Canada Day
  { month: 7, day: 4 }, // Independence Day (US)
  { month: 11, day: 11 }, // Remembrance Day (Canada) / Veterans Day (US)
  { month: 12, day: 25 }, // Christmas
  { month: 12, day: 26 } // Boxing Day (Canada)
]

// Function to check if date is a holiday
const isHoliday = (month: number, day: number): boolean => {
  return holidays.some((h) => h.month === month && h.day === day)
}

interface ThumbProps extends React.HTMLAttributes<HTMLSpanElement> {
  ownerState?: unknown
  'data-index'?: number
  sliderValue?: number
  solarAltitude?: number
  maxSolarAltitude?: number
}

export const CalendarThumb = forwardRef<HTMLSpanElement, ThumbProps>(
  (props, ref) => {
    const {
      children,
      ownerState: _ownerState,
      'data-index': _dataIndex,
      sliderValue,
      ...other
    } = props

    const dateInfo = useMemo(() => {
      if (typeof sliderValue !== 'number')
        return { day: '', month: '', isHoliday: false }

      const currentYear = dayjs().year()
      const date = dayjs().year(currentYear).dayOfYear(sliderValue)

      return {
        day: date.format('D'),
        month: date.format('MMM').toUpperCase(),
        isHoliday: isHoliday(date.month() + 1, date.date())
      }
    }, [sliderValue])

    const { day, month, isHoliday: holiday } = dateInfo
    // a bare span inherits the browser's sans-serif, not the theme's font
    const { typography } = useTheme()

    return (
      <span
        {...other}
        ref={ref}
        style={{
          ...other.style,
          fontFamily: typography.fontFamily,
          display: 'flex',
          userSelect: 'none',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          color: holiday ? darken(error, 0.3) : '#000',
          lineHeight: 1
        }}
      >
        {children}
        <span style={{ fontSize: 15 }}>{day}</span>
        <span style={{ fontSize: 9 }}>{month}</span>
      </span>
    )
  }
)

CalendarThumb.displayName = 'CalendarThumb'

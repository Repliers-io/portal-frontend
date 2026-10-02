import React, { useMemo } from 'react'
import dayjs from 'dayjs'

const dayPixel = 1.5

interface MicroMonthProps {
  month: number // 0-11
  year: number
  weekStartsOn?: 'sunday' | 'monday'
}

export const MicroMonth: React.FC<MicroMonthProps> = ({
  month,
  year,
  weekStartsOn = 'sunday'
}) => {
  const weeks = useMemo(() => {
    const firstDay = dayjs(`${year}-${month + 1}-01`)
    const daysInMonth = firstDay.daysInMonth()

    // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
    let startDayOfWeek: number = firstDay.day()

    // Adjust for week starting on Monday
    if (weekStartsOn === 'monday')
      startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    const weeksArray: { offsetDays: number; daysCount: number }[] = []
    let currentDay = 1

    // First week with offset
    const daysInFirstWeek = 7 - startDayOfWeek
    weeksArray.push({
      offsetDays: startDayOfWeek,
      daysCount: Math.min(daysInFirstWeek, daysInMonth)
    })
    currentDay += daysInFirstWeek

    // Full weeks
    while (currentDay <= daysInMonth) {
      const remainingDays = daysInMonth - currentDay + 1
      const daysInWeek = Math.min(7, remainingDays)
      weeksArray.push({
        offsetDays: 0,
        daysCount: daysInWeek
      })
      currentDay += 7
    }

    // Ensure we always have 5 weeks
    while (weeksArray.length < 5) {
      weeksArray.push({ offsetDays: 0, daysCount: 0 })
    }

    return weeksArray.slice(0, 5)
  }, [month, year, weekStartsOn])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${dayPixel}px`
      }}
    >
      {weeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          style={{
            height: `${dayPixel}px`,
            display: 'flex'
          }}
        >
          {week.offsetDays > 0 && (
            <div
              style={{
                height: `${dayPixel}px`,
                width: `${week.offsetDays * dayPixel}px`
              }}
            />
          )}
          {week.daysCount > 0 && (
            <div
              style={{
                borderRadius: '1px',
                height: `${dayPixel}px`,
                width: `${week.daysCount * dayPixel}px`,
                backgroundColor: '#fff'
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

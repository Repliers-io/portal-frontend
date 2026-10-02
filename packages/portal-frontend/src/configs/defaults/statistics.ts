import dayjs from 'dayjs'

import { type PropertyClass } from '@defaults/filters'

const getLastMonths = () => {
  const months = new Array(4).fill(null)
  return months.reduce((acc: { date: string; label: string }[], _, index) => {
    const date = dayjs().subtract(index, 'month')
    acc[index] = {
      date: date.format('YYYY-MM'),
      label: date.format('MMM YYYY')
    }
    return acc
  }, [])
}

const lastMonths = getLastMonths()

export const monthShift = dayjs().date() <= 20 ? 1 : 0
export const labels = lastMonths.map((month) => month.label)
export const dates = lastMonths.map((month) => month.date)

// Base defaultWidgetData (without volume)
export const defaultWidgetData = {
  activeListings: {
    values: [0],
    dates: dates.slice(0, 1),
    labels: labels.slice(0, 1)
  },
  soldPrices: {
    values: [0, 0, 0],
    dates: dates.slice(monthShift, monthShift + 3),
    labels: labels.slice(monthShift, monthShift + 3)
  },
  newListings: {
    values: [0, 0, 0],
    dates: dates.slice(0, 3),
    labels: labels.slice(0, 3)
  },
  soldListings: {
    values: [0, 0, 0],
    dates: dates.slice(monthShift, monthShift + 3),
    labels: labels.slice(monthShift, monthShift + 3)
  },
  daysOnMarket: {
    values: [0, 0, 0],
    dates: dates.slice(monthShift, monthShift + 3),
    labels: labels.slice(monthShift, monthShift + 3)
  }
}

/** Property classes behind the sold-price chart on a dashboard city card. */
export const cityCardClasses: PropertyClass[] = ['residential']

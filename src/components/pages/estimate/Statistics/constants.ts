import dayjs from 'dayjs'

import { getLastMonthes, type WidgetsData } from './utils'

const lastMonthes = getLastMonthes()

export const dropCurrentMonth = dayjs().date() <= 20 ? 1 : 0
export const labels = lastMonthes.map((month) => month.label)
export const dates = lastMonthes.map((month) => month.date)

export const defaultWidgetData: WidgetsData = {
  activeListings: {
    values: [0],
    dates: dates.slice(0, 1),
    labels: labels.slice(0, 1)
  },
  soldPrices: {
    values: [0, 0, 0],
    dates: dates.slice(dropCurrentMonth),
    labels: labels.slice(dropCurrentMonth)
  },
  newListings: {
    values: [0, 0, 0],
    dates: dates.slice(0, 3),
    labels: labels.slice(0, 3)
  },
  soldListings: {
    values: [0, 0, 0],
    dates: dates.slice(dropCurrentMonth),
    labels: labels.slice(dropCurrentMonth)
  },
  daysOnMarket: {
    values: [0, 0, 0],
    dates: dates.slice(dropCurrentMonth),
    labels: labels.slice(dropCurrentMonth)
  }
}

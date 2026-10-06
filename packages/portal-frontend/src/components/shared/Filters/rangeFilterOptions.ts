import dayjs from 'dayjs'

const currentYear = dayjs().year()

export const relativeOptions = [
  { value: 'lastDay', label: 'Last 1 day', short: '1d' },
  { value: 'last3d', label: 'Last 3 days', short: '3d' },
  { value: 'lastWeek', label: 'Last 7 days', short: '7d' },
  { value: 'last30d', label: 'Last 30 days', short: '30d' },
  { value: 'last90d', label: 'Last 90 days', short: '90d' },
  { value: 'last180d', label: 'Last 180 days', short: '180d' },
  { value: 'lastYear', label: 'Last 365 days', short: '365d' }
] as const

export const yearOptions = Array.from({ length: 20 }, (_, i) => {
  const year = String(currentYear - i)
  return { value: year, label: `Year ${year}`, short: year }
})

export const allRangeOptions = [...relativeOptions, ...yearOptions]

export const activeRangeOptions = [
  { value: 'lastDay', label: 'Last 1 day', short: '1d' },
  { value: 'last3d', label: 'Last 3 days', short: '3d' },
  { value: 'lastWeek', label: 'Last 7 days', short: '7d' },
  { value: 'last30d', label: 'Last 30 days', short: '30d' },
  { value: 'last90d', label: 'Last 90 days', short: '90d' },
  { value: 'moreThan15d', label: 'More than 15 days', short: '>15d' },
  { value: 'moreThan30d', label: 'More than 30 days', short: '>30d' },
  { value: 'moreThan60d', label: 'More than 60 days', short: '>60d' },
  { value: 'moreThan90d', label: 'More than 90 days', short: '>90d' }
] as const

import dayjs from 'dayjs'

import { type ApiListing } from 'services/API'

import { daysOnMarketCount } from './status'

type Translate = (
  key: string,
  values?: Record<string, string | number | Date>
) => string

// When the raw RESO cumulative fields are present (NWMLS feed), days on market
// is the cumulative count at the last modification plus calendar days since —
// the counter ticks at midnight, like on the MLS itself. Zero is a valid value:
// a fresh listing has no accumulated days. Returns null when the feed doesn't
// ship the fields.
const cumulativeDaysOnMarket = (listing: ApiListing): number | null => {
  const cumulativeDays = listing.raw?.CumulativeDaysOnMarket
  const modTimestamp = listing.raw?.OriginatingSystemModificationTimestamp
  if (!cumulativeDays || !modTimestamp) return null

  const daysSinceModification = dayjs()
    .startOf('day')
    .diff(dayjs(modTimestamp).startOf('day'), 'day')
  return daysSinceModification + Number(cumulativeDays)
}

// Long durations collapse into months/years so the label stays readable.
const daysOnMarketLabel = (count: number, t: Translate): string => {
  if (!Number.isFinite(count)) return ''
  if (count >= 730) {
    // 2 years or more — round to nearest 0.5
    return t('Property.yearsOnMarket', {
      count: Math.round((count / 365) * 2) / 2
    })
  }
  if (count >= 182) {
    // 6 months or more
    return t('Property.monthsOnMarket', { count: Math.floor(count / 30) })
  }
  return t('Property.daysOnMarket', { count })
}

/**
 * Creates property utility functions with translation context using ICU Message Format
 * Usage: const { getDaysOnMarket, getUpdatedDays } = createListingI18nUtils(t)
 */

export const createListingI18nUtils = (t: Translate) => {
  return {
    // Days on market for the CURRENT listing, taken from the concrete API value:
    // daysOnMarket for sold listings, simpleDaysOnMarket for active ones.
    getDaysOnMarket: (listing: ApiListing) => {
      const cumulative = cumulativeDaysOnMarket(listing)
      if (cumulative !== null) {
        return {
          count: cumulative,
          label: t('Property.daysOnMarket', { count: cumulative })
        }
      }

      // zero passes through untouched: the i18n message renders it as "Listed today"
      const count = daysOnMarketCount(listing)
      if (!Number.isFinite(count)) return { count: NaN, label: '' }

      return { count, label: daysOnMarketLabel(count, t) }
    },

    // Calendar days since listDate. Kept ONLY for the status-history timeline,
    // which has no per-entry days-on-market value; never use it to show DOM.
    getDaysSinceListed: (listing: ApiListing) => {
      if (!listing.listDate) return { count: NaN, label: '' }

      const cumulative = cumulativeDaysOnMarket(listing)
      if (cumulative !== null) {
        return {
          count: cumulative,
          label: t('Property.daysOnMarket', { count: cumulative })
        }
      }

      const count = dayjs().diff(dayjs(listing.listDate), 'day')
      return { count, label: daysOnMarketLabel(count, t) }
    },

    getUpdatedDays: (days: string) => {
      const updatedDays = dayjs().diff(dayjs(days), 'day')

      return {
        count: updatedDays,
        label: t('Property.updatedDaysAgo', { count: updatedDays })
      }
    }
  }
}

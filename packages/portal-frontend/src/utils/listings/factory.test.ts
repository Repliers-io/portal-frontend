import { type ApiListing } from 'services/API'

import { createListingI18nUtils } from './factory'

const t = (key: string, values?: Record<string, string | number | Date>) =>
  `${key}:${String(values?.count)}`

const { getDaysOnMarket } = createListingI18nUtils(t)

const nwmls = (cumulative: string, modTimestamp: string) =>
  ({
    raw: {
      CumulativeDaysOnMarket: cumulative,
      OriginatingSystemModificationTimestamp: modTimestamp
    }
  }) as unknown as ApiListing

// timestamps are local-time (no offset) so the calendar math is deterministic
// regardless of the machine's timezone
beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2026-08-19T10:00:00'))
})

afterAll(() => {
  jest.useRealTimers()
})

describe('getDaysOnMarket with NWMLS cumulative fields', () => {
  it('adds nothing while the modification day is still today', () => {
    expect(getDaysOnMarket(nwmls('5', '2026-08-19T08:00:00')).count).toBe(5)
  })

  it('counts calendar days, not full 24h periods', () => {
    // two calendar days ago late evening: the raw diff is only ~1.5 days
    expect(getDaysOnMarket(nwmls('5', '2026-08-17T23:00:00')).count).toBe(7)
  })

  it('keeps a genuine zero for a fresh listing', () => {
    expect(getDaysOnMarket(nwmls('0', '2026-08-19T08:00:00')).count).toBe(0)
  })
})

describe('getDaysOnMarket from API fields', () => {
  it('keeps zero so the i18n "Listed today" branch still fires', () => {
    const freshListing = {
      status: 'A',
      lastStatus: 'New',
      simpleDaysOnMarket: 0
    } as unknown as ApiListing
    expect(getDaysOnMarket(freshListing).count).toBe(0)
  })
})

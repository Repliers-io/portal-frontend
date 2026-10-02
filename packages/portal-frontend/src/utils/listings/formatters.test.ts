import dayjs from 'dayjs'

import { type ApiListingAddress } from 'services/API'

import { property1, property2, property3 } from './__mocks__'
import {
  formatFullAddress,
  formatMultiLineText,
  formatOpenHouseBadge,
  formatOpenHouseTimeRange,
  formatShortAddress,
  formatTimeSlot,
  formatTitleAddress
} from './formatters'

describe('utils/listings/formatters', () => {
  it('should correctly format short address line from address object', () => {
    expect(formatShortAddress(property1.address)).toBe(
      '#PH3 - 135 Lower Barrette Way EAST'
    )
    expect(formatShortAddress(property3.address)).toBe("13/5 D'artagnan` Bay")
    expect(formatShortAddress({} as unknown as ApiListingAddress)).toBe('')
  })

  it('should drop the unit when it is masked to the same sentinel as the street number', () => {
    // CardAddress scrubs a restricted map/cluster listing by masking both
    // unitNumber and streetNumber to the scrubbed sentinel; the equal-values
    // guard must then drop the unit so map cards match the side-grid card.
    expect(
      formatShortAddress({
        ...property1.address,
        unitNumber: '!scrubbed!',
        streetNumber: '!scrubbed!'
      })
    ).toBe('!scrubbed! Lower Barrette Way EAST')
  })

  it('should format the compact title address (bare unit after number, directionals around the street)', () => {
    expect(
      formatTitleAddress({
        unitNumber: 'B',
        streetNumber: '3816',
        streetName: 'EVANSTON',
        streetSuffix: 'Avenue',
        streetDirection: 'N'
      } as ApiListingAddress)
    ).toBe('3816 B Evanston Avenue N')
    // NWMLS NWM2586517 "721 E Mason Lake Drive E": prefix and post-directional both kept
    expect(
      formatTitleAddress({
        streetNumber: '721',
        streetDirectionPrefix: 'E',
        streetName: 'Mason Lake',
        streetSuffix: 'Drive',
        streetDirection: 'E'
      } as ApiListingAddress)
    ).toBe('721 E Mason Lake Drive E')
    // no unit → number stays first with no gap
    expect(
      formatTitleAddress({
        streetNumber: '135',
        streetName: 'LOWER BARRETTE',
        streetSuffix: 'Way'
      } as ApiListingAddress)
    ).toBe('135 Lower Barrette Way')
  })

  it('should correctly format full address line from address object', () => {
    expect(formatFullAddress(property1.address)).toBe(
      '#PH3 - 135 Lower Barrette Way EAST, Ottawa, K1L 7Z9'
    )
    expect(formatFullAddress(property2.address)).toBe(
      '135 Lower Barrette Way, Ottawa, K1L 7Z9'
    )
    expect(formatFullAddress(property3.address)).toBe(
      "13/5 D'artagnan` Bay, Ottawa"
    )
    expect(formatFullAddress({} as unknown as ApiListingAddress)).toBe('')
  })

  it('should correctly format open house time slot (time only, no date)', () => {
    expect(formatTimeSlot('12:00 PM', '3:00 PM')).toBe('12-3PM')
    expect(formatTimeSlot('12:00 PM', '12:30 PM')).toBe('12-12:30PM')
    expect(formatTimeSlot('4:00 PM', '4:00 PM')).toBe('4PM')
    expect(formatTimeSlot('10:45 AM', '1:45 PM')).toBe('10:45AM-1:45PM')
    // AM → PM suffix shown on start when suffixes differ
    expect(formatTimeSlot('10:30 AM', '1:00 PM')).toBe('10:30AM-1PM')
    // same suffix omitted from start
    expect(formatTimeSlot('1:00 PM', '2:00 PM')).toBe('1-2PM')
  })

  it('should correctly format open house time slot from ISO datetime strings (converted to tenant timezone)', () => {
    // 17:00-21:00 UTC = 10AM-2PM Pacific (UTC-7 PDT)
    expect(
      formatTimeSlot(
        '2026-03-27T17:00:00.000-00:00',
        '2026-03-27T21:00:00.000-00:00'
      )
    ).toBe('10AM-2PM')
    // 18:00-20:30 UTC = 11AM-1:30PM Pacific
    expect(
      formatTimeSlot(
        '2026-03-27T18:00:00.000-00:00',
        '2026-03-27T20:30:00.000-00:00'
      )
    ).toBe('11AM-1:30PM')
    // 20:00-22:00 UTC = 1-3PM Pacific
    expect(
      formatTimeSlot(
        '2026-03-27T20:00:00.000-00:00',
        '2026-03-27T22:00:00.000-00:00'
      )
    ).toBe('1-3PM')
  })

  it('should correctly format open house time range (date + time slot)', () => {
    expect(
      formatOpenHouseTimeRange({
        date: '2024-10-01',
        startTime: '12:00 PM',
        endTime: '3:00 PM'
      })
    ).toBe('Tue, Oct 1, 12-3PM')
    expect(
      formatOpenHouseTimeRange({
        date: '2024-10-04',
        startTime: '12:00 PM',
        endTime: '12:30 PM'
      })
    ).toBe('Fri, Oct 4, 12-12:30PM')
    expect(
      formatOpenHouseTimeRange({
        date: '2024-10-01',
        startTime: '4:00 PM',
        endTime: '4:00 PM'
      })
    ).toBe('Tue, Oct 1, 4PM')
    expect(
      formatOpenHouseTimeRange({
        date: '2024-10-01',
        startTime: '10:45 AM',
        endTime: '1:45 PM'
      })
    ).toBe('Tue, Oct 1, 10:45AM-1:45PM')
  })

  it('should correctly format open house badge (day of week + time slot)', () => {
    expect(
      formatOpenHouseBadge({
        date: '2024-10-01',
        startTime: '12:00 PM',
        endTime: '3:00 PM'
      })
    ).toBe('Tue 12-3PM')
    expect(
      formatOpenHouseBadge({
        date: '2024-10-06',
        startTime: '2:00 PM',
        endTime: '4:00 PM'
      })
    ).toBe('Sun 2-4PM')
    expect(
      formatOpenHouseBadge({
        date: '2024-10-01',
        startTime: '10:00 AM',
        endTime: '10:45 AM'
      })
    ).toBe('Tue 10-10:45AM')
  })

  it('should show Today when open house is today', () => {
    const today = dayjs().format('YYYY-MM-DD')
    expect(
      formatOpenHouseBadge({
        date: today,
        startTime: '12:00 PM',
        endTime: '2:00 PM'
      })
    ).toBe('Today 12-2PM')
  })

  it('should correctly format multi-line text', () => {
    const text1 = ' This is a single line   text. '
    expect(formatMultiLineText(text1)).toMatch(
      /<p[^>]*>This is a single line text.<\/p>/
    )

    const text2 = 'This is a\n\rmulti-line\r\ntext.'
    expect(formatMultiLineText(text2)).toMatch(
      /<p[^>]*>This is a<\/p><p[^>]*>multi-line<\/p><p[^>]*>text.<\/p>/
    )

    const text3 = 'This\nis a\n\nmulti-line\n\ntext.'
    expect(formatMultiLineText(text3)).toMatch(
      /<p[^>]*>This is a<\/p><p[^>]*>multi-line<\/p><p[^>]*>text.<\/p>/
    )

    const text4 = 'This is a single line text with <-more-> divider.'
    expect(formatMultiLineText(text4)).toMatch(
      /<p[^>]*>This is a single line text with divider.<\/p>/
    )
  })
})

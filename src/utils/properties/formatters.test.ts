import { type PropertyAddress } from 'services/API'

import { property1, property2, property3 } from './__mocks__'
import {
  formatFullAddress,
  formatMultiLineText,
  formatOpenHouseTimeRange,
  formatShortAddress
} from './formatters'

describe('utils/properties/formatters', () => {
  it('should correctly format short address line from address object', () => {
    expect(formatShortAddress(property1.address)).toBe(
      '#PH3 - 135 Lower Barrette Way EAST'
    )
    expect(formatShortAddress(property3.address)).toBe("13/5 D'artagnan` Bay")
    expect(formatShortAddress({} as unknown as PropertyAddress)).toBe('')
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
    expect(formatFullAddress({} as unknown as PropertyAddress)).toBe('')
  })

  it('should correctly format open house time range', () => {
    expect(
      formatOpenHouseTimeRange('2024-10-01 1200', '2024-10-01 15:00:00')
    ).toBe('Tue, Oct 1, 12-3PM')
    expect(
      formatOpenHouseTimeRange('2024-10-04 12:00', '2024-10-01 1230')
    ).toBe('Fri, Oct 4, 12-12:30PM')
    expect(formatOpenHouseTimeRange('2024/10/1 1600', '2024-10-01 1600')).toBe(
      'Tue, Oct 1, 4PM'
    )
    expect(formatOpenHouseTimeRange('2024-10-01 1045', '2024-10-01 1345')).toBe(
      'Tue, Oct 1, 10:45AM-1:45PM'
    )
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

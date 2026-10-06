'use client'

import React from 'react'
import dayjs from 'dayjs'

import i18nConfig from '@configs/i18n'

import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
// Powers the `z` timezone-abbreviation token used by explicit formats.
dayjs.extend(timezone)

const DateLabel = React.memo(
  ({ value = '', format }: { value: string | number; format?: string }) => {
    // Date-only default renders in UTC so timezones west of UTC don't roll it back a
    // day; an explicit format may carry time/zone tokens, so render it as-is (local).
    const parsed = format ? dayjs(value) : dayjs(value).utc()
    return <span>{parsed.format(format || i18nConfig.dateFormatShort)}</span>
  }
)

DateLabel.displayName = 'DateLabel'
export default DateLabel

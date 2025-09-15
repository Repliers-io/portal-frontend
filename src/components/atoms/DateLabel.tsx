'use client'

import React from 'react'
import dayjs from 'dayjs'

import i18nConfig from '@configs/i18n'

const DateLabel = React.memo(({ value = '' }: { value: string | number }) => {
  return <span>{dayjs(value).format(i18nConfig.dateFormatShort)}</span>
})

DateLabel.displayName = 'DateLabel'
export default DateLabel

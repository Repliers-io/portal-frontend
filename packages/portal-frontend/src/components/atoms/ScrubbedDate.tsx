'use client'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import listingsConfig from '@configs/listings'

import { type Primitive } from 'utils/formatters'
import { scrubbed } from 'utils/listings'

import DateLabel from './DateLabel'
import { ScrubbedSkeleton } from './ScrubbedText'

const ScrubbedDate = React.memo(
  ({
    value = '',
    format = '',
    defaultValue = listingsConfig.scrubbed.datePlaceholder
  }: {
    value?: Primitive
    format?: string
    defaultValue?: string
  }) => {
    if (scrubbed(value)) {
      const scrubbedHtml = renderToStaticMarkup(
        ScrubbedSkeleton({ value: defaultValue })
      )

      return <span dangerouslySetInnerHTML={{ __html: scrubbedHtml }} />
    }
    return <DateLabel value={value as string} format={format} />
  }
)
ScrubbedDate.displayName = 'ScrubbedDate'
export default ScrubbedDate

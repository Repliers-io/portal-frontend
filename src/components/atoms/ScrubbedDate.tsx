'use client'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { type Primitive } from 'utils/formatters'
import { scrubbed } from 'utils/properties'

import DateLabel from './DateLabel'
import { ScrubbedSkeleton } from './ScrubbedText'

// We use 'XXX XX, 19XX' as a dummy value in the JSX below to prevent crawlers
// from scrapping / storing all our listings under one 1990-01-01 date

const ScrubbedDate = React.memo(
  ({
    value = '',
    defaultValue = 'XXX XX, 19XX' // example: 'Jan 01, 1990'
  }: {
    value?: Primitive
    defaultValue?: string
  }) => {
    if (scrubbed(value)) {
      const scrubbedHtml = renderToStaticMarkup(
        ScrubbedSkeleton({ value: defaultValue })
      )
      // eslint-disable-next-line react/no-danger
      return <span dangerouslySetInnerHTML={{ __html: scrubbedHtml }} />
    }
    return <DateLabel value={value as string} />
  }
)
ScrubbedDate.displayName = 'ScrubbedDate'
export default ScrubbedDate

'use client'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  formatEnglishPrice,
  type Primitive,
  toSafeNumber
} from 'utils/formatters'
import { scrubbed } from 'utils/properties'

import { ScrubbedSkeleton } from './ScrubbedText'

const ScrubbedPrice = React.memo(
  ({
    value = '',
    defaultValue = '$,$$$,$$$'
  }: {
    value?: Primitive
    defaultValue?: string
  }) => {
    const number = toSafeNumber(value)
    if (scrubbed(value) || !number) {
      const scrubbedHtml = renderToStaticMarkup(
        ScrubbedSkeleton({ value: defaultValue })
      )
      // eslint-disable-next-line react/no-danger
      return <span dangerouslySetInnerHTML={{ __html: scrubbedHtml }} />
    } else {
      return <span>{formatEnglishPrice(number)}</span>
    }
  }
)
ScrubbedPrice.displayName = 'ScrubbedPrice'
export default ScrubbedPrice

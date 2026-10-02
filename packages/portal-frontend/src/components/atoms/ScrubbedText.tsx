'use client'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import listingsConfig from '@configs/listings'

export const ScrubbedSkeleton = ({ value = '***' }: { value?: string }) => (
  <span
    className="scrubbed-value"
    style={{
      minWidth: 12,
      height: 'auto',
      textAlign: 'center',
      borderRadius: '4px',
      color: 'transparent',
      lineHeight: 'inherit',
      // keep multi-word placeholders ("square ft", "0,00 acres") on one line —
      // without this they wrap inside the narrow map popup and balloon the card
      whiteSpace: 'nowrap',
      display: 'inline-block',
      backgroundColor: '#DDDDDD'
    }}
  >
    {value}
  </span>
)

const ScrubbedText = React.memo(
  ({
    replace = '***',
    children
  }: {
    replace?: string
    children?: React.ReactNode
  }) => {
    let scrubbedHtml: string
    // create a static container / placeholder, do not process children if not passed
    if (typeof children === 'undefined') {
      scrubbedHtml = renderToStaticMarkup(
        ScrubbedSkeleton({
          value: replace
        })
      )
    } else {
      const skeletonMarkup = renderToStaticMarkup(
        ScrubbedSkeleton({ value: replace })
      )
      const str = renderToStaticMarkup(children)
      scrubbedHtml = str.replaceAll(
        new RegExp(listingsConfig.scrubbed.data, 'gi'),
        skeletonMarkup
      )
    }

    return <span dangerouslySetInnerHTML={{ __html: scrubbedHtml }} />
  }
)

ScrubbedText.displayName = 'ScrubbedText'

export default ScrubbedText

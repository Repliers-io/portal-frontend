'use client'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import propsConfig from '@configs/properties'

export const ScrubbedSkeleton = ({ value = '***' }: { value?: string }) => (
  <span
    style={{
      height: 'auto',
      minWidth: 12,
      textAlign: 'center',
      borderRadius: '4px',
      color: 'transparent',
      lineHeight: 'inherit',
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
        new RegExp(propsConfig.scrubbedDataString, 'gi'),
        skeletonMarkup
      )
    }

    // eslint-disable-next-line react/no-danger
    return <span dangerouslySetInnerHTML={{ __html: scrubbedHtml }} />
  }
)

ScrubbedText.displayName = 'ScrubbedText'

export default ScrubbedText

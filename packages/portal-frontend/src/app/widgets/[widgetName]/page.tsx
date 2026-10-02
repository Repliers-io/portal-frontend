import React from 'react'

import { WidgetRenderer } from '@shared/CmsContentRenderer/components/WidgetRenderer'
import { type WidgetConfig } from '@shared/CmsWidgets'

import { type RouteProps } from 'app/types'

import AiSearchProvider from 'providers/AiSearchProvider'
import SearchProvider from 'providers/SearchProvider'
import { unflattenParams } from 'utils/path'

export const dynamic = 'force-dynamic'

type WidgetEmbeddedPageProps = RouteProps<
  { widgetName: string },
  Record<string, string | string[]>
>

/**
 * Embedded widget page for iframe usage on external sites
 * Renders widgets with parameters from URL query string
 *
 * Example URL: /widgets/Widget1?title=Hello&count=42&enabled=true&tags=tag1&tags=tag2
 */
const WidgetEmbeddedPage = async ({
  params,
  searchParams
}: WidgetEmbeddedPageProps) => {
  const { widgetName } = await params
  const queryParams = await searchParams

  // Convert query params to widget config. Dot-notation keys (e.g.
  // `listings.mlsNumber`) are expanded into nested objects, and repeated params
  // (`?listings.mlsNumber=A&listings.mlsNumber=B`) arrive as arrays — matching
  // the CMS widget-tag parser, so `listings: { mlsNumber: [...] }` reaches the widget.
  // WidgetRenderer will handle unknown widgets with UnknownWidget component
  const widget: WidgetConfig = {
    name: widgetName,
    props: unflattenParams(queryParams),
    originalMatch: `[${widgetName}]`
  }

  return (
    <SearchProvider>
      <AiSearchProvider>
        <WidgetRenderer widget={widget} />
      </AiSearchProvider>
    </SearchProvider>
  )
}

export default WidgetEmbeddedPage

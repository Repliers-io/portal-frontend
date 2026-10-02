import React from 'react'

import type { WidgetConfig } from '@shared/CmsWidgets/types'

import { WidgetRenderer } from '.'

interface WidgetMdxRendererProps {
  name: string
  [key: string]: unknown
}

/**
 * Component for embedding widgets directly in MDX files
 *
 * Usage in MDX:
 * ```mdx
 * <Widget name="Widget1" title="My Title" count={42} enabled={true} tags={["tag1", "tag2"]} />
 * ```
 *
 * Props are typed natively by MDX (no coercion needed).
 * Converts MDX props to WidgetConfig and delegates to WidgetRenderer.
 */
export const WidgetMdxRenderer = ({
  name,
  ...props
}: WidgetMdxRendererProps) => {
  // Convert MDX props to WidgetConfig format
  const widget: WidgetConfig = {
    name,
    props: props as Record<string, unknown>,
    originalMatch: `<Widget name="${name}" ... />`
  }

  // Delegate to WidgetRenderer (it handles validation, errors, wrapping)
  return <WidgetRenderer widget={widget} />
}

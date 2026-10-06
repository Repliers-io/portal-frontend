import React from 'react'

import { UnknownWidget } from '@shared/CmsWidgets'
import { getWidgetSchema, hasWidget } from '@shared/CmsWidgets/registry'
import type { WidgetConfig } from '@shared/CmsWidgets/types'

import { transformWidgetProps } from '../utils/widgetTransform'

import { WidgetValidationErrors } from '.'

interface WidgetRendererProps {
  widget: WidgetConfig
}

/**
 * Renders a widget by name from the registry
 * - If widget is registered: renders actual component with transformed props
 * - If widget is unknown: renders placeholder for development
 * - Displays Joi validation errors below the widget if present
 */
export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  // Check if widget is registered
  if (!hasWidget(widget.name)) return <UnknownWidget widget={widget} />

  // Get schema and component
  const schema = getWidgetSchema(widget.name)
  if (!schema) return <UnknownWidget widget={widget} />

  // Transform props according to schema and validate with Joi
  const { props, errors } = transformWidgetProps(widget, schema)

  // Render the actual widget component
  // repliers-widget class isolates widget from CMS content styles
  const WidgetComponent = schema.component

  return (
    <div className="repliers-widget">
      <WidgetValidationErrors widgetName={widget.name} errors={errors} />
      <WidgetComponent {...props} />
    </div>
  )
}

import type React from 'react'

export type WidgetParamType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'string[]'
  | 'number[]'

/**
 * Schema for a single widget parameter
 */
export interface WidgetParamSchema {
  /** Expected type after transformation */
  type: WidgetParamType
  /** Whether the parameter is required */
  required?: boolean
  /** Default value if not provided */
  defaultValue?: string | number | boolean | string[] | number[]
  /** Force single value to array */
  forceArray?: boolean
}

/**
 * Complete schema for a widget
 */
export interface WidgetSchema {
  /** Widget component to render */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>
  /** Schema for each parameter */
  params: Record<string, WidgetParamSchema>
}

/**
 * Registry of all available widgets
 */
export type WidgetRegistry = Record<string, WidgetSchema>

/**
 * Raw widget props parsed from content
 */
export interface WidgetConfig {
  name: string
  props: Record<string, string | string[]>
  originalMatch: string
}

/**
 * Transformed widget props ready for component
 */
export interface TransformedWidgetProps {
  [key: string]: string | number | boolean | string[] | number[]
}

import type Joi from 'joi'
import type React from 'react'

export type WidgetParamType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'string[]'
  | 'number[]'
  | 'object'

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
  /** Nested properties for object type */
  properties?: Record<string, WidgetParamSchema>
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
  /** Optional Joi validation schema for transformed props */
  validation?: Joi.ObjectSchema
}

/**
 * Registry of all available widgets
 */
export type WidgetRegistry = Record<string, WidgetSchema>

/**
 * Raw widget props parsed from content
 * Props can be strings/arrays from HTML parsing or typed values from MDX
 */
export interface WidgetConfig {
  name: string
  props: Record<string, unknown>
  originalMatch: string
}

/**
 * Transformed widget props ready for component
 * Supports nested objects for structured parameters (e.g., listings: { ... })
 */
export interface TransformedWidgetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * Result of widget props transformation with validation
 */
export interface WidgetTransformResult {
  props: TransformedWidgetProps
  errors: string[]
}

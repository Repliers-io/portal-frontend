import type {
  TransformedWidgetProps,
  WidgetConfig,
  WidgetParamSchema,
  WidgetSchema,
  WidgetTransformResult
} from '@shared/CmsWidgets'

import { getPath, getPaths } from 'utils/path'

const validMatchKey = /^match[1-9]$/
const reservedMatchKey = /^match\d+$/
const queryFieldKey = /^[\w.]+$/

/**
 * Moves reserved `match1..9` groups out of a listings params object into a
 * `queries` array (raw OR-batches). Each group's nested object is deep-flattened
 * back into dotted keys (e.g. { raw: { BuyerAgentKey } } -> { 'raw.BuyerAgentKey' }),
 * so it matches the backend field names. Base filters are kept as-is.
 * Out-of-range `match<N>` (match0, match10, ...) are dropped and reported.
 */
export const collapseMatchQueries = (
  listings: Record<string, unknown>
): { listings: Record<string, unknown>; errors: string[] } => {
  const errors: string[] = []
  const base: Record<string, unknown> = {}
  const matchKeys: string[] = []

  for (const [key, value] of Object.entries(listings)) {
    if (validMatchKey.test(key)) {
      matchKeys.push(key)
    } else if (reservedMatchKey.test(key)) {
      errors.push(`listings.${key}: match index must be between 1 and 9`)
    } else {
      base[key] = value
    }
  }

  if (!matchKeys.length) {
    return { listings: errors.length ? base : listings, errors }
  }

  matchKeys.sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)))

  const queries = matchKeys.map((key) => {
    const group = (listings[key] ?? {}) as Record<string, unknown>
    const query: Record<string, unknown> = {}
    for (const path of getPaths(group)) {
      if (!queryFieldKey.test(path)) {
        errors.push(`listings.${key}.${path}: invalid field name`)
        continue
      }
      query[path] = getPath(group, path)
    }
    return query
  })

  return { listings: { ...base, queries }, errors }
}

/**
 * Transforms a single parameter value according to its schema
 * Supports both type coercion from strings (HTML) and pass-through of typed values (MDX)
 */
function transformParam(
  value: unknown,
  schema: WidgetParamSchema
): string | number | boolean | string[] | number[] {
  const { type } = schema

  // Type validators for MDX case (already typed values) - only for primitives
  const typeChecks: Record<string, (v: unknown) => boolean> = {
    string: (v) => typeof v === 'string',
    number: (v) => typeof v === 'number',
    boolean: (v) => typeof v === 'boolean'
  }

  // Return as-is if already correct type (MDX case)
  if (typeChecks[type]?.(value)) return value as string | number | boolean

  // Type coercion (HTML case)
  switch (type) {
    case 'number':
      return parseFloat(value as string) || 0

    case 'boolean':
      return value === 'true' || value === '1' || value === 'yes'

    case 'string[]':
      return [value].flat() as string[]

    case 'number[]':
      return [value].flat().map((v) => parseFloat(v as string) || 0)

    default:
      return value as string
  }
}

/**
 * Parameter name mapping within listings object
 * Maps old child key names to new child key names (e.g., 'count' -> 'resultsPerPage')
 * Applied to listings.count -> listings.resultsPerPage
 */
const LISTINGS_PARAM_MAPPING: Record<string, string> = {
  count: 'resultsPerPage'
}

/**
 * Transforms raw widget props according to schema (type coercion)
 * - Converts strings to numbers when needed
 * - Forces single values to arrays
 * - Converts string arrays to number arrays
 * - Applies default values
 * - Handles nested object schemas via dot notation (e.g., 'listings.maxPrice' -> { listings: { maxPrice: ... }})
 * - Validates props with Joi schema if provided (required check happens there)
 */
export function transformWidgetProps(
  widget: WidgetConfig,
  schema: WidgetSchema
): WidgetTransformResult {
  const transformed: TransformedWidgetProps = {}
  const errors: string[] = []

  // Helper function to process nested object schemas from dot notation
  const processObjectSchema = (
    parentKey: string,
    objectSchema: WidgetParamSchema,
    rawProps: Record<string, unknown>
  ): Record<string, unknown> | undefined => {
    const result: Record<string, unknown> = {}
    let hasRealValues = false

    // Check if nested object exists in rawProps
    const nestedObject =
      typeof rawProps[parentKey] === 'object' && rawProps[parentKey] !== null
        ? (rawProps[parentKey] as Record<string, unknown>)
        : undefined

    // If properties schema is empty, pass through ALL nested object values
    // BUT still apply key mapping for listings params
    if (
      !objectSchema.properties ||
      Object.keys(objectSchema.properties).length === 0
    ) {
      if (nestedObject) {
        // Apply key mapping if this is listings object
        if (parentKey === 'listings') {
          for (const [key, value] of Object.entries(nestedObject)) {
            const mappedKey = LISTINGS_PARAM_MAPPING[key] || key
            result[mappedKey] = value
            hasRealValues = true
          }
          const collapsed = collapseMatchQueries(result)
          errors.push(...collapsed.errors)
          return hasRealValues ? collapsed.listings : undefined
        }
        return nestedObject // Pass through as-is for non-listings objects
      }
      return undefined
    }

    // Otherwise process according to schema
    if (objectSchema.properties) {
      for (const [childKey, childSchema] of Object.entries(
        objectSchema.properties
      )) {
        const dotNotationKey = `${parentKey}.${childKey}`

        // Check multiple places:
        // 1. Inside nested object: rawProps.listings.resultsPerPage
        // 2. Dot notation key: rawProps['listings.resultsPerPage']
        // 3. Direct key: rawProps['resultsPerPage']
        const nestedValue = nestedObject?.[childKey]

        let rawValue =
          nestedValue ?? rawProps[dotNotationKey] ?? rawProps[childKey]

        // Apply child key mapping if this is listings object
        if (
          !rawValue &&
          parentKey === 'listings' &&
          LISTINGS_PARAM_MAPPING[childKey]
        ) {
          const mappedKey = `${parentKey}.${LISTINGS_PARAM_MAPPING[childKey]}`
          rawValue =
            rawProps[mappedKey] ?? rawProps[LISTINGS_PARAM_MAPPING[childKey]]
        }

        if (rawValue !== undefined) {
          result[childKey] = transformParam(rawValue, childSchema)
          hasRealValues = true
        } else if (childSchema.defaultValue !== undefined) {
          result[childKey] = childSchema.defaultValue
        }
      }
    }

    // Only return result if there were actual passed values (not just defaults)
    return hasRealValues ? result : undefined
  }

  // Process each parameter from schema
  for (const [paramName, paramSchema] of Object.entries(schema.params)) {
    // Handle object type with nested properties
    if (paramSchema.type === 'object' && paramSchema.properties) {
      const objectResult = processObjectSchema(
        paramName,
        paramSchema,
        widget.props
      )
      if (objectResult !== undefined) {
        transformed[paramName] = objectResult
      }
      continue
    }

    const rawValue = widget.props[paramName]

    // Apply default if value is missing
    if (rawValue === undefined) {
      if (paramSchema.defaultValue !== undefined) {
        transformed[paramName] = paramSchema.defaultValue
      }
      continue
    }

    // Transform based on type (handles both HTML strings and MDX typed values)
    transformed[paramName] = transformParam(rawValue, paramSchema)
  }

  // Validate with Joi schema if provided
  if (schema.validation) {
    const validationResult = schema.validation.validate(transformed, {
      abortEarly: false
    })

    if (validationResult.error) {
      validationResult.error.details.forEach((detail) => {
        errors.push(detail.message)
      })
    }
  }
  return { props: transformed, errors }
}

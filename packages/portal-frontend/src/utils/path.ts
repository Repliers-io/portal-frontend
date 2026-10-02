/**
 * Gets the value at path of object
 * @param obj The object to query
 * @param path The path of the property to get
 * @returns The resolved value
 */
export const getPath = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, key) => {
    return acc !== undefined && acc !== null && key in acc
      ? acc[key]
      : undefined
  }, obj)
}

export const setPath = (obj: any, path: string, value: any): any => {
  const parts = path.split('.')
  const last = parts.pop()
  if (!last) return { ...obj }

  const newObj = { ...obj }
  let current = newObj

  for (const part of parts) {
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {}
    } else {
      current[part] = { ...current[part] }
    }
    current = current[part]
  }

  current[last] = value
  return newObj
}

/**
 * Expands a flat map with dot-notation keys into a nested object.
 * `{ 'listings.mlsNumber': ['A', 'B'], title: 'x' }`
 *   -> `{ listings: { mlsNumber: ['A', 'B'] }, title: 'x' }`.
 * Values are copied as-is (repeated URL params already arrive as arrays), so
 * this is the single un-flatten step shared by CMS widget tags and iframe URLs.
 */
export const unflattenParams = (
  obj: Record<string, unknown>
): Record<string, unknown> => {
  let result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key.includes('.')) {
      result = setPath(result, key, value)
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Removes the property at path of object
 * @param obj The object to modify
 * @param path The path of the property to remove
 */
export const removePath = (obj: any, path: string): any => {
  const parts = path.split('.')
  const last = parts.pop()
  if (!last) return { ...obj }

  if (!parts.length) {
    const { [last]: _, ...rest } = obj
    return rest
  }

  const parentPath = parts.join('.')
  const parent = getPath(obj, parentPath)
  if (parent) {
    const updatedParent = removePath(parent, last)
    return setPath(obj, parentPath, updatedParent)
  }

  return { ...obj }
}

export const getPaths = (
  obj: any,
  maxDepth = Infinity,
  prefix = '',
  depth = 0
): string[] => {
  if (depth >= maxDepth) return [prefix].filter(Boolean)

  let paths: string[] = []
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = obj[key]
      const path = prefix ? `${prefix}.${key}` : key
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        paths = paths.concat(getPaths(value, maxDepth, path, depth + 1))
      } else {
        paths.push(path)
      }
    }
  }
  return paths
}

/**
 * Removes multiple properties at specified paths of the object and returns a new object
 */
export const removePaths = (obj: any, paths: string[]): any => {
  return paths.reduce((result, path) => removePath(result, path), { ...obj })
}

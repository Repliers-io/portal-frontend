import { logWarn } from 'utils/log'

/**
 * Log a critical warning when falling back to local markdown content
 * from an external CMS
 */
export function fallbackWarning(slug: string): void {
  logWarn(`WARNING: EXTERNAL CMS PAGE "${slug}" FALLBACK TO LOCAL MARKDOWN`)
}

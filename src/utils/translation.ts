/**
 * Translation utilities for safe handling of dynamic content
 */

/**
 * Checks if a string is a translation key
 * @param str - string to check
 * @returns true if string is a translation key
 */
export const isTranslationKey = (str: string): boolean => {
  return str.startsWith('pdp.') || str.startsWith('Charts.')
}

/**
 * Safe translation: translates only translation keys, returns dynamic content as-is
 * Prevents "MISSING_MESSAGE" errors for dynamic values
 * @param t - translation function from next-intl
 * @param text - text to translate
 * @returns translated text or original text for dynamic values
 */
export const safeTranslate = (
  t: (key: string) => string,
  text: string
): string => {
  if (!text) return ''
  return isTranslationKey(text) ? t(text) : text
}

/**
 * Safe translation with fallback value
 * @param t - translation function
 * @param text - text to translate
 * @param fallback - default value
 * @returns translated text, original text, or fallback
 */
export const safeTranslateWithFallback = (
  t: (key: string) => string,
  text: string,
  fallback: string = ''
): string => {
  if (!text) return fallback
  return isTranslationKey(text) ? t(text) : text
}

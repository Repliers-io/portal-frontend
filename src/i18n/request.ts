import { getRequestConfig } from 'next-intl/server'
import deepmerge from 'deepmerge'

import { timeZone } from '@configs/i18n'

const env = String(process.env.NEXT_PUBLIC_APP_CONFIGURATION || '').trim()

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const locale = 'en'

  // Load fallback (defaults) translations - these are required
  let fallbackMessages = {}
  try {
    const fallbackModule = await import(`./defaults/${locale}.json`)
    fallbackMessages = fallbackModule.default
  } catch (err) {
    console.error('Failed to load fallback messages:', err)
    // Fallback messages are critical, but we'll continue with empty object
    fallbackMessages = {}
  }

  // Load instance-specific translations - these are optional
  let instanceMessages = {}
  if (env) {
    try {
      const instanceModule = await import(`./${env}/${locale}.json`)
      instanceMessages = instanceModule.default
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // This is OK - not all environments have custom translations
      instanceMessages = {}
    }
  }

  // Merge fallback with instance-specific (instance overrides fallback)
  const messages = deepmerge(fallbackMessages, instanceMessages) as Record<
    string,
    unknown
  >

  return {
    locale,
    messages,
    timeZone
  }
})

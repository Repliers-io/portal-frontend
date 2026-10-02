import type { CmsRoutingConfig } from 'services/CMS/types'

/**
 * CMS Page Routing Configuration
 *
 * Resolution priority:
 * 1. Exact match (highest)
 * 2. Wildcard patterns (longer patterns first)
 * 3. Default '*' (lowest)
 */
export const cmsRoutingConfig: CmsRoutingConfig = {
  pages: {
    // =========================================================================
    // PRIORITY 1: EXACT MATCHES
    // =========================================================================

    // --- Legal pages (always local, version controlled) ---
    'terms-of-use': 'localOnly',
    'privacy-policy': 'localOnly',
    'cookies-policy': 'localOnly',
    'dmca-notice': 'localOnly',
    accessibility: 'localOnly',

    // --- Marketing pages (remote CMS with local fallback) ---
    about: 'remoteFirst',
    'contact-us': 'remoteFirst',

    // --- Dev/test pages (local only) ---
    'widgets-test': 'localOnly',

    // =========================================================================
    // PRIORITY 2: WILDCARD PATTERNS (longer patterns match first)
    // =========================================================================

    // --- Blog: all content from remote CMS ---
    'blog/*': 'remoteOnly',

    // =========================================================================
    // PRIORITY 3: DEFAULT (fallback for all other pages)
    // =========================================================================
    '*': 'remoteFirst'
  },

  // Enable logging for debugging resolution logic
  debug: false,

  foldersIndexMode: 'hideChildren',
  hideEmptyPages: true
}

export default cmsRoutingConfig

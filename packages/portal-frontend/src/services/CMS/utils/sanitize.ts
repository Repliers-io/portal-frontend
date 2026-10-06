import { decode } from 'he'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

const normalizeHostname = (hostname: string) => hostname.replace(/^www\./, '')

// Registrable domain approximation: last two labels (cms.urbnlivn.com -> urbnlivn.com).
// Sufficient for tenant domains on simple TLDs; not Public-Suffix-List aware.
const baseDomain = (hostname: string): string =>
  hostname.split('.').slice(-2).join('.')

// True when `hostname` is the site itself or any (old) subdomain of its base domain,
// e.g. urbnlivn.com / www.urbnlivn.com / blog.urbnlivn.com all match base "urbnlivn.com".
const internalHost = (hostname: string, base: string): boolean => {
  const host = normalizeHostname(hostname)
  return host === base || host.endsWith(`.${base}`)
}

// Convert an absolute internal URL (the site or any subdomain of its base domain) to a
// root-relative path. Returns null for external/relative/malformed URLs (caller keeps them).
const internalToRelative = (
  url: string,
  wpBaseDomain: string | null
): string | null => {
  if (!wpBaseDomain) return null
  try {
    const parsed = new URL(url)
    if (internalHost(parsed.hostname, wpBaseDomain)) {
      return parsed.pathname + parsed.search + parsed.hash
    }
  } catch {
    // relative or malformed — leave to caller
  }
  return null
}

const safeOrigin = (url?: string | null): string | null => {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

const safeHostname = (url?: string | null): string | null => {
  if (!url) return null
  try {
    return normalizeHostname(new URL(url).hostname)
  } catch {
    return null
  }
}

// Point a WordPress-hosted image at the CMS origin. Relative paths, own-site URLs, and any
// URL on the site's base domain or its (old) subdomains are rewritten to cmsOrigin; genuinely
// third-party URLs are left untouched.
const rewriteImageUrl = (
  raw: string,
  cmsOrigin: string,
  siteHostname: string | null,
  wpBaseDomain: string | null
): string => {
  const url = raw.trim()
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return raw

  if (!/^https?:\/\//i.test(url)) {
    try {
      return new URL(url, cmsOrigin).href
    } catch {
      return raw
    }
  }

  try {
    const parsed = new URL(url)
    const sameSite =
      !!siteHostname && normalizeHostname(parsed.hostname) === siteHostname
    const family = !!wpBaseDomain && internalHost(parsed.hostname, wpBaseDomain)
    if (sameSite || family) {
      return cmsOrigin + parsed.pathname + parsed.search + parsed.hash
    }
  } catch {
    // malformed — keep as-is
  }
  return raw
}

const rewriteSrcset = (
  srcset: string,
  cmsOrigin: string,
  siteHostname: string | null,
  wpBaseDomain: string | null
): string =>
  srcset
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim()
      if (!trimmed) return candidate
      const gap = trimmed.search(/\s/)
      const link = gap === -1 ? trimmed : trimmed.slice(0, gap)
      const descriptor = gap === -1 ? '' : trimmed.slice(gap)
      return (
        rewriteImageUrl(link, cmsOrigin, siteHostname, wpBaseDomain) +
        descriptor
      )
    })
    .join(', ')

/**
 * Rewrite CMS URLs in a raw HTML string, leaving everything else untouched. Mirrors
 * sanitizeHtmlContent's img/a transforms but without sanitizing — for content rendered
 * as-is via the raw renderer (blog posts / pages use `contentRaw`), which bypasses
 * sanitizeHtmlContent entirely:
 *  - `src` / `srcset` of WordPress-hosted images → CMS origin (e.g. www.urbnlivn.com images
 *    404 because the files live on cms.urbnlivn.com)
 *  - internal `href` (the site / its subdomains) → root-relative path (stay in the portal)
 *
 * @param wpBaseUrl - CMS base URL; falls back to WORDPRESS_API_URL for the origin/base domain.
 */
export function rewriteCmsContentUrls(
  html?: string | null,
  wpBaseUrl?: string
): string {
  if (!html || typeof html !== 'string') return ''

  const cmsOrigin = safeOrigin(wpBaseUrl || process.env.WORDPRESS_API_URL)
  if (!cmsOrigin) return html

  const linkHostname = safeHostname(wpBaseUrl || process.env.WORDPRESS_API_URL)
  const wpBaseDomain = linkHostname ? baseDomain(linkHostname) : null
  const siteHostname = safeHostname(process.env.NEXT_PUBLIC_APP_DOMAIN)

  return html
    .replace(
      /(\ssrc=)(["'])(.*?)\2/gi,
      (_match, attr, quote, url) =>
        `${attr}${quote}${rewriteImageUrl(url, cmsOrigin, siteHostname, wpBaseDomain)}${quote}`
    )
    .replace(
      /(\ssrcset=)(["'])(.*?)\2/gi,
      (_match, attr, quote, value) =>
        `${attr}${quote}${rewriteSrcset(value, cmsOrigin, siteHostname, wpBaseDomain)}${quote}`
    )
    .replace(/(\shref=)(["'])(.*?)\2/gi, (_match, attr, quote, url) => {
      const relative = internalToRelative(url, wpBaseDomain)
      return `${attr}${quote}${relative ?? url}${quote}`
    })
}

/**
 * Clean HTML content from CMS
 * Removes dangerous tags, decodes entities, and normalizes whitespace
 * @param html - HTML string to sanitize
 * @param excludedTags - Tags to remove from allowed tags list
 * @param wpBaseUrl - WordPress site base URL. The base domain / CMS origin are sourced from
 *   this arg when given (blog), otherwise from WORDPRESS_API_URL — so all server-rendered CMS
 *   content is normalized. Internal links (the site and any subdomain of its base domain —
 *   e.g. old urbnlivn.com subdomains) become relative paths; WordPress-hosted images on those
 *   same hosts (and relative ones) are pointed at the CMS origin. External URLs are untouched.
 */
export function sanitizeHtmlContent(
  html?: string | null,
  excludedTags: string[] = ['span'],
  wpBaseUrl?: string
): string {
  if (!html || typeof html !== 'string') return ''

  // Build allowedTags list and filter out excluded tags
  let allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'figure'])

  if (excludedTags) {
    allowedTags = allowedTags.filter((tag) => !excludedTags.includes(tag))
  }

  // Link relativization covers the site and any subdomain of its base domain. Use the explicit
  // wpBaseUrl when provided (blog), otherwise fall back to the configured WP API URL so ACF /
  // building and other server-rendered CMS content is relativized too.
  const linkHostname = safeHostname(wpBaseUrl || process.env.WORDPRESS_API_URL)
  const wpBaseDomain = linkHostname ? baseDomain(linkHostname) : null
  // WordPress-hosted images are pointed at the CMS origin (same env fallback as links),
  // so building/ACF and other server-rendered content gets normalized too.
  const cmsOrigin = safeOrigin(wpBaseUrl || process.env.WORDPRESS_API_URL)
  const siteHostname = safeHostname(process.env.NEXT_PUBLIC_APP_DOMAIN)

  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['id'],
      img: ['src', 'alt', 'width', 'height', 'srcset', 'loading'],
      a: ['href', 'name', 'target', 'rel']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    nonBooleanAttributes: [],
    disallowedTagsMode: 'discard',
    // Allow WordPress Gutenberg block classes so layout/styling works
    allowedClasses: {
      '*': [/^wp-block-/, /^wp-element-/, /^has-/, /^is-/, /^are-/]
    },
    transformTags: {
      // Remove empty paragraphs during transformation
      p: (tagName, attribs) => {
        return { tagName, attribs }
      },
      // Rewrite internal links (site + any subdomain of its base domain) to relative paths
      a: (tagName, attribs) => {
        const relative = attribs.href
          ? internalToRelative(attribs.href, wpBaseDomain)
          : null
        return relative
          ? { tagName, attribs: { ...attribs, href: relative } }
          : { tagName, attribs }
      },
      // Rewrite content image URLs (and srcset) to the CMS origin
      img: (tagName, attribs) => {
        if (!cmsOrigin) return { tagName, attribs }
        const next = { ...attribs }
        if (attribs.src) {
          next.src = rewriteImageUrl(
            attribs.src,
            cmsOrigin,
            siteHostname,
            wpBaseDomain
          )
        }
        if (attribs.srcset) {
          next.srcset = rewriteSrcset(
            attribs.srcset,
            cmsOrigin,
            siteHostname,
            wpBaseDomain
          )
        }
        return { tagName, attribs: next }
      }
    }
  })
    .replace(/<p>\s*<\/p>/gi, '') // Remove empty paragraphs
    .replace(/<(\w+)[^>]*>\s*<\/\1>/gi, '') // Remove all empty tags (e.g., <span></span>, <div></div>)
    .replace(/\s{2,}/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Render markdown to sanitized HTML — the shared server-side pipeline for
 * markdown content (e.g. job descriptions). Keeps marked + sanitize-html in one
 * place so every markdown surface produces identical, safe markup.
 */
export function markdownToSafeHtml(markdown: string): string {
  return sanitizeHtmlContent(
    marked.parse(markdown, { gfm: true, breaks: true }) as string
  )
}

/**
 * Clean plain text content (for excerpts, descriptions)
 * Strips all HTML tags and normalizes whitespace
 */
export function sanitizeTextContent(text?: string | null): string {
  if (!text || typeof text !== 'string') return ''

  // Strip all HTML tags, decode entities, normalize whitespace
  return decode(text)
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/\s{2,}/g, ' ') // Normalize whitespace
    .trim()
}

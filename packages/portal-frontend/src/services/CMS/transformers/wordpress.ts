import {
  type WordPressAuthorPayload,
  type WordPressMenuItem
} from '../clients/WordPressClient/types'
import {
  type CmsMenuItem,
  type ContentAuthor,
  type ContentStatus,
  type Page,
  type Post
} from '../types'
import {
  rewriteCmsContentUrls,
  sanitizeHtmlContent,
  sanitizeTextContent
} from '../utils/sanitize'

const linkToPath = (url?: string): string | undefined =>
  url ? new URL(url).pathname.replace(/\/$/, '') : undefined

/**
 * Helper to parse date strings
 */
const parseDate = (value?: string) => {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * Helper to extract ACF photo field
 */
const extractAcfPhoto = (acf?: Record<string, unknown>): string | undefined => {
  if (!acf || typeof acf !== 'object') return undefined

  // Check common ACF field names for photos
  const photoFields = ['photo', 'image', 'avatar'] as const
  for (const field of photoFields) {
    const value = acf[field]
    if (typeof value === 'string' && value) {
      return value
    }
    // Handle ACF image object with url property
    if (
      value &&
      typeof value === 'object' &&
      'url' in value &&
      typeof value.url === 'string'
    ) {
      return value.url
    }
  }

  return undefined
}

/**
 * Transform WordPress author to ContentAuthor type
 */
export function transformAuthor(author: WordPressAuthorPayload): ContentAuthor {
  // Use WordPress photo from ACF (already resolved to URL by AuthorsService)
  const avatar = extractAcfPhoto(author.acf)

  const result = {
    id: String(author.id),
    slug: author.slug || String(author.id),
    name: author.name || String(author.id),
    avatar,
    bio: author.description || undefined,
    url: author.link || author.url || undefined,
    website: author.url || undefined,
    email: author.email || undefined,
    username: author.username || author.user_login || undefined,
    firstName: author.first_name || undefined,
    lastName: author.last_name || undefined,
    nickname: author.nickname || undefined,
    locale: author.locale || undefined,
    roles: Array.isArray(author.roles) ? author.roles : undefined,
    registeredAt: parseDate(author.registered_date || author.registered),
    postCount:
      typeof (author as any).post_count === 'number'
        ? (author as any).post_count
        : typeof (author as any).count === 'number'
          ? (author as any).count
          : undefined,
    agentId:
      typeof author.acf?.agent_mls_id === 'string' && author.acf.agent_mls_id
        ? author.acf.agent_mls_id
        : undefined,
    acf: author.acf,
    meta:
      author.meta && typeof author.meta === 'object' ? author.meta : undefined,
    source: 'wordpress' as const
  }

  return result
}

/**
 * Common transformation logic for WordPress content
 */
function transformBaseContent(content: any, baseUrl?: string) {
  const yoast = content.yoast_head_json || {}
  const wpFeaturedMedia = content._embedded?.['wp:featuredmedia']?.[0] || null

  // Check for ACF excerpt field (used in custom post types like news)
  const acfExcerpt =
    content.acf?.excerpt && typeof content.acf.excerpt === 'string'
      ? content.acf.excerpt
      : undefined

  const excerpt = acfExcerpt || sanitizeTextContent(content.excerpt?.rendered)
  const title = sanitizeTextContent(content.title?.rendered)

  // Yoast exposes two independent sets: `title`/`description` are the SEO snippet fields
  // an editor fills in, `og_*`/`twitter_*` belong to the Social tab (Yoast mirrors the SEO
  // values there only while Social is left empty). <title>/<meta description> therefore read
  // the SEO fields; the social tags keep their own.
  // Yoast values arrive HTML-encoded — decode them, otherwise Next escapes the `&` again and
  // the tag ships literal `&#215;` / `&hellip;` instead of `×` / `…`.
  const metaTitle = sanitizeTextContent(yoast.title) || title
  const metaDescription = sanitizeTextContent(yoast.description) || excerpt
  const ogTitle = sanitizeTextContent(yoast.og_title) || metaTitle
  const ogDescription =
    sanitizeTextContent(yoast.og_description) || metaDescription

  return {
    id: content.id.toString(),
    slug: content.slug,
    path: linkToPath(content.link),
    parentId: content.parent ? String(content.parent) : undefined,
    title,
    excerpt,
    content: sanitizeHtmlContent(content.content?.rendered, undefined, baseUrl),
    // contentRaw is rendered as-is by the raw renderer (bypasses sanitizeHtmlContent),
    // so rewrite its image URLs to the CMS origin and internal links to relative here.
    contentRaw: rewriteCmsContentUrls(content.content?.raw, baseUrl),
    status: (content.status === 'publish'
      ? 'published'
      : 'draft') as ContentStatus,
    publishedAt: content.date ? new Date(content.date) : undefined,
    updatedAt: content.modified ? new Date(content.modified) : undefined,
    featuredImage: wpFeaturedMedia
      ? {
          url:
            wpFeaturedMedia.media_details?.sizes?.full?.source_url ||
            wpFeaturedMedia.source_url,
          alt: wpFeaturedMedia.alt_text,
          width: wpFeaturedMedia.media_details?.width,
          height: wpFeaturedMedia.media_details?.height
        }
      : undefined,
    meta: {
      title: metaTitle,
      description: metaDescription,
      // Yoast canonical points to the WP backend domain — always omit it.
      // The portal canonical is supplied by buildCmsMetadata() via pageCanonical.
      alternates: undefined,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        siteName: sanitizeTextContent(yoast.og_site_name) || undefined,
        locale: yoast.og_locale,
        images: yoast.og_image?.[0]
          ? [
              {
                url: yoast.og_image[0].url,
                width: yoast.og_image[0].width,
                height: yoast.og_image[0].height,
                alt: sanitizeTextContent(yoast.og_image[0].alt) || title
              }
            ]
          : undefined
      },
      twitter:
        yoast.twitter_title || yoast.twitter_description || yoast.twitter_image
          ? {
              card:
                yoast.twitter_card ||
                (yoast.twitter_image ? 'summary_large_image' : 'summary'),
              site: yoast.twitter_site || undefined,
              title: sanitizeTextContent(yoast.twitter_title) || ogTitle,
              description:
                sanitizeTextContent(yoast.twitter_description) || ogDescription,
              images: yoast.twitter_image
                ? [yoast.twitter_image]
                : yoast.og_image?.[0]?.url
                  ? [yoast.og_image[0].url]
                  : undefined
            }
          : undefined
    }
  }
}

/**
 * Transform WordPress post to Post type
 */
export function transformPost(post: any, baseUrl?: string): Post {
  if (!post || typeof post !== 'object') {
    throw new Error('Invalid post data')
  }

  const authorData = post._embedded?.author?.[0]
  const wpTerms = post._embedded?.['wp:term']
  const wpCategories = wpTerms?.[0] || []
  const wpTags = wpTerms?.[1] || []

  const base = transformBaseContent(post, baseUrl)
  return {
    ...base,
    acf: post.acf || undefined,
    type: 'post',
    author: authorData ? transformAuthor(authorData) : undefined,
    meta: {
      ...base.meta,
      openGraph: {
        ...base.meta.openGraph,
        type: 'article',
        publishedTime: post.date,
        modifiedTime: post.modified,
        authors: authorData?.name ? [authorData.name] : undefined,
        tags: wpTags.map((tag: any) => tag.name)
      }
    },
    tags: wpTags.map(({ id, name, slug, count }: any) => ({
      id,
      name,
      slug,
      count
    })),
    categories: wpCategories
      .filter((cat: any) => cat.name.toLowerCase() !== 'uncategorized')
      .map(({ id, name, slug, count }: any) => ({
        id: String(id),
        name,
        slug,
        count
      }))
  }
}

/**
 * Transform WordPress page to Page type
 */
export function transformPage(page: any, baseUrl?: string): Page {
  const base = transformBaseContent(page, baseUrl)
  return {
    ...base,
    type: 'page',
    meta: {
      ...base.meta,
      openGraph: {
        ...base.meta.openGraph,
        type: 'website'
      }
    }
  }
}

/**
 * Transform WordPress menu item to MenuItem type.
 *
 * @param wpBaseUrl - WordPress site base URL. When provided, strips the WP origin from
 *   internal links so they become relative paths. External (third-party) URLs are kept
 *   as full absolute URLs.
 */
export function transformMenuItem(
  item: WordPressMenuItem,
  baseUrl?: string
): CmsMenuItem {
  let url = item.url

  if (baseUrl && url) {
    try {
      const normalizeHostname = (h: string) => h.replace(/^www\./, '')
      const wpHostname = normalizeHostname(new URL(baseUrl).hostname)
      const urlObj = new URL(url)
      if (normalizeHostname(urlObj.hostname) === wpHostname) {
        url = urlObj.pathname + urlObj.search + urlObj.hash
      }
    } catch {
      // Relative or malformed URL — keep as-is
    }
  }

  return {
    id: item.id,
    title: sanitizeTextContent(
      typeof item.title === 'object' ? item.title.rendered : item.title
    ),
    url,
    order: item.menu_order,
    target: item.target || undefined
  }
}

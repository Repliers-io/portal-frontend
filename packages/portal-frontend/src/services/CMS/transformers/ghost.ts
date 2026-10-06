import { type GhostAuthorPayload } from '../clients/GhostClient/types'
import {
  type ContentAuthor,
  type ContentStatus,
  type Page,
  type Post
} from '../types'
import { sanitizeHtmlContent, sanitizeTextContent } from '../utils/sanitize'

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
 * Transform Ghost author to ContentAuthor type
 */
export function transformAuthor(author: GhostAuthorPayload): ContentAuthor {
  return {
    id: author.id,
    slug: author.slug || String(author.id),
    name: author.name || '',
    avatar: author.profile_image || undefined,
    coverImage: author.cover_image || undefined,
    bio: author.bio || undefined,
    url: author.url || undefined,
    website: author.website || undefined,
    location: author.location || undefined,
    facebook: author.facebook || undefined,
    twitter: author.twitter || undefined,
    metaTitle: author.meta_title || undefined,
    metaDescription: author.meta_description || undefined,
    updatedAt: parseDate(author.updated_at),
    registeredAt: parseDate(author.created_at),
    postCount: author.count?.posts,
    source: 'ghost'
  }
}

/**
 * Common transformation logic for Ghost content
 */
function transformBaseContent(content: any) {
  return {
    id: content.id,
    slug: content.slug,
    path: linkToPath(content.url),
    title: sanitizeHtmlContent(content.title),
    excerpt: sanitizeTextContent(content.excerpt || content.custom_excerpt),
    content: sanitizeHtmlContent(content.html),
    status: (content.status === 'published'
      ? 'published'
      : 'draft') as ContentStatus,
    publishedAt: content.published_at
      ? new Date(content.published_at)
      : undefined,
    updatedAt: content.updated_at ? new Date(content.updated_at) : undefined,
    featuredImage: content.feature_image
      ? {
          url: content.feature_image,
          alt: content.feature_image_alt
        }
      : undefined,
    meta: {
      title: content.meta_title || content.title,
      description: content.meta_description || content.excerpt,
      openGraph: {
        title: content.og_title || content.meta_title || content.title,
        description:
          content.og_description || content.meta_description || content.excerpt,
        siteName: content.og_site_name,
        locale: content.locale,
        images:
          content.og_image || content.feature_image
            ? [
                {
                  url: content.og_image || content.feature_image,
                  alt: content.feature_image_alt || content.title
                }
              ]
            : undefined
      },
      twitter: {
        card: content.twitter_image ? 'summary_large_image' : 'summary',
        title: content.twitter_title || content.meta_title || content.title,
        description:
          content.twitter_description ||
          content.meta_description ||
          content.excerpt,
        images:
          content.twitter_image || content.feature_image
            ? [content.twitter_image || content.feature_image]
            : undefined
      },
      alternates: {
        canonical: content.canonical_url
      }
    }
  }
}

/**
 * Transform Ghost post to Post type
 */
export function transformPost(post: any): Post {
  const authorData = post.primary_author

  return {
    ...transformBaseContent(post),
    type: 'post',
    author: authorData ? transformAuthor(authorData) : undefined,
    meta: {
      ...transformBaseContent(post).meta,
      openGraph: {
        ...transformBaseContent(post).meta.openGraph,
        type: 'article',
        publishedTime: post.published_at,
        modifiedTime: post.updated_at,
        authors: post.primary_author?.name
          ? [post.primary_author.name]
          : undefined,
        tags: post.tags?.map((tag: any) => tag.name)
      }
    },
    tags:
      post.tags?.map((tag: any) => ({
        name: tag.name,
        slug: tag.slug,
        count: tag.count?.posts
      })) || [],
    categories: []
  }
}

/**
 * Transform Ghost page to Page type
 */
export function transformPage(page: any): Page {
  return {
    ...transformBaseContent(page),
    type: 'page',
    meta: {
      ...transformBaseContent(page).meta,
      openGraph: {
        ...transformBaseContent(page).meta.openGraph,
        type: 'website'
      }
    }
  }
}

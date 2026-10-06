import { type ContentAuthor } from '../../types'

import { type GhostAuthorPayload } from './types'

export const parseDate = (value?: string) => {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export const getErrorStatusCode = (error: unknown): number | undefined => {
  const value = error as {
    statusCode?: number
    response?: { status?: number }
  }

  if (typeof value?.statusCode === 'number') return value.statusCode
  if (typeof value?.response?.status === 'number') return value.response.status

  return undefined
}

export const toGhostAuthor = (author: GhostAuthorPayload): ContentAuthor => ({
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
})

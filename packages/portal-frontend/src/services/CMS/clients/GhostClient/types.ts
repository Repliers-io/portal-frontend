export interface GhostAuthorPayload {
  id: string
  slug?: string
  name?: string
  profile_image?: string
  cover_image?: string
  bio?: string
  url?: string
  website?: string
  location?: string
  facebook?: string
  twitter?: string
  meta_title?: string
  meta_description?: string
  updated_at?: string
  created_at?: string
  count?: {
    posts?: number
  }
}

export type GhostPostsBrowseParams = {
  limit: number | 'all'
  include: Array<'tags' | 'authors'>
  order?: string
  page?: number
  filter?: string
}

export type GhostTagWithCount = {
  name?: string
  slug: string
  count?: { posts?: number }
}

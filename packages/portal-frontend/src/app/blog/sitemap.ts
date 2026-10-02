import { type MetadataRoute } from 'next'

import features from '@configs/features'
import routes from '@configs/routes'

import CmsService, { type Post } from 'services/CMS'

export const revalidate = 3600

// WordPress caps per_page at 100, and getPosts() without a limit inherits WP's default
// of 10 — which silently cut the sitemap down to the ten newest posts. Page through it.
const batchSize = 100

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!features.blog) return []
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    const client = CmsService.getBlogClient()

    const posts: Post[] = []
    let offset = 0
    let hasMore = true
    while (hasMore) {
      const batch = await client.getPosts({ limit: batchSize, offset })
      posts.push(...batch)
      hasMore = batch.length === batchSize
      offset += batchSize
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

    return posts.map((post) => ({
      url: `${baseUrl}${routes.blog}/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))
  } catch {
    return []
  }
}

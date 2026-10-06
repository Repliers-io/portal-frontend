import { type MetadataRoute } from 'next'

import blogConfig from '@configs/blog'
import features from '@configs/features'
import routes from '@configs/routes'

import CmsService from 'services/CMS'

export const revalidate = 86400

const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!features.blog) return []
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    const { featuredAuthors } = blogConfig as {
      featuredAuthors?: string[]
    }

    let slugs: string[]

    if (featuredAuthors?.length) {
      slugs = featuredAuthors
    } else {
      const client = CmsService.getBlogClient()
      const authors = await client.getAuthors()
      slugs = authors.map((a) => a.slug)
    }

    return slugs.map((slug) => ({
      url: `${baseUrl}${routes.author}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6
    }))
  } catch {
    return []
  }
}

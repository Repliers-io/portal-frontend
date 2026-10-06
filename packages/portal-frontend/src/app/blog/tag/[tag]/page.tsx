import React from 'react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import blogConfig from '@configs/blog'
import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { StaticPageTemplate } from '@templates'
import { BlogTagPageContent } from '@pages/blog'

import { type RouteParamsProps } from 'app/types'

import CmsService from 'services/CMS'

const { postsPerPage } = blogConfig

type Props = RouteParamsProps<{ tag: string }>

// ISR: Revalidate every hour - pages generated on-demand, cached for 3600s
export const revalidate = 3600
// Allow dynamic params - generate pages on first request instead of at build time
export const dynamicParams = true

// Disabled for ISR - kept for reference
export async function _generateStaticParams_disabled() {
  try {
    const client = CmsService.getBlogClient()
    const tags = await client.getTags()
    return tags.map((tag) => ({ tag: tag.slug }))
  } catch (error) {
    console.error('Failed to generate static params for blog tags', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const meta = content.pagesMeta.blogTag

  return {
    title: String(meta?.title ?? '').replace('{tag}', tag),
    description: String(meta?.description ?? '').replace('{tag}', tag),
    openGraph: { type: 'website' as const, siteName: content.siteName },
    alternates: { canonical: `${routes.blog}/tag/${tag}` }
  }
}

const BlogTagPage = async ({ params }: Props) => {
  if (!features.blog) notFound()

  const { tag } = await params
  const client = CmsService.getBlogClient()

  const [posts, totalPosts] = await Promise.all([
    client.getPosts({
      tag,
      offset: 0,
      limit: postsPerPage
    }),
    client.getTotalPosts({ tag })
  ])

  if (!posts || !posts.length) {
    notFound()
  }

  return (
    <StaticPageTemplate title="Blog">
      <BlogTagPageContent
        tag={tag}
        posts={posts}
        currentPage={0}
        totalPosts={totalPosts}
      />
    </StaticPageTemplate>
  )
}

export default BlogTagPage

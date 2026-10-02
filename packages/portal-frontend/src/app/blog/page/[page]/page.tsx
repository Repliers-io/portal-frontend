import React from 'react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import blogConfig from '@configs/blog'
import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { StaticPageTemplate } from '@templates'
import { BlogIndexPageContent } from '@pages/blog'

import { type RouteParamsProps } from 'app/types'

import CmsService from 'services/CMS'

const { postsPerPage } = blogConfig

type Props = RouteParamsProps<{ page: string }>

// ISR: Revalidate every hour - pages generated on-demand, cached for 3600s
export const revalidate = 3600
// Allow dynamic params - generate pages on first request instead of at build time
export const dynamicParams = true

// Disabled for ISR - kept for reference
export async function _generateStaticParams_disabled() {
  try {
    const client = CmsService.getBlogClient()

    // Get total posts to calculate pages
    if (client.getPostPaths) {
      const paths = await client.getPostPaths()
      const totalPages = Math.ceil(paths.length / postsPerPage)

      return Array.from({ length: totalPages }, (_, i) => ({
        page: String(i + 1)
      }))
    }

    return []
  } catch (error) {
    console.error('Failed to generate static params for blog pages', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params
  const pageNum = parseInt(page, 10)
  const meta = content.pagesMeta.blogPage

  return {
    title: String(meta?.title ?? '').replace('{page}', String(pageNum)),
    description: String(meta?.description ?? ''),
    openGraph: { type: 'website' as const, siteName: content.siteName },
    alternates: {
      canonical: pageNum === 1 ? routes.blog : `${routes.blog}/page/${pageNum}`
    }
  }
}

const BlogPagedPage = async ({ params }: Props) => {
  if (!features.blog) notFound()

  const { page } = await params
  const pageNum = parseInt(page, 10)
  const currentPage = pageNum - 1 // Convert to 0-based

  if (isNaN(pageNum) || pageNum < 1) {
    notFound()
  }

  const client = CmsService.getBlogClient()

  // Category tree / tag cloud on the index page are planned but not shipped —
  // re-enable these fetches together with the props in BlogIndexPageContent.
  const [posts, totalPosts] = await Promise.all([
    client.getPosts({
      limit: postsPerPage,
      offset: currentPage * postsPerPage
    }),
    // client.getCategories(),
    // client.getTags(),
    client.getTotalPosts()
  ])

  if (pageNum > 1 && !posts.length) {
    notFound()
  }

  return (
    <StaticPageTemplate title="Blog">
      <BlogIndexPageContent
        posts={posts}
        // tags={tags}
        // categories={categories}
        currentPage={currentPage}
        totalPosts={totalPosts}
      />
    </StaticPageTemplate>
  )
}

export default BlogPagedPage

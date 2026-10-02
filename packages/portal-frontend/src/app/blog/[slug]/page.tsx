import React from 'react'
import { type Metadata } from 'next'
import { notFound, unstable_rethrow } from 'next/navigation'

import blogConfig from '@configs/blog'
import content from '@configs/content'
import features from '@configs/features'
import { BlogPostTemplate, Page40XTemplate } from '@templates'
import { BlogPostPageContent } from '@pages/blog'

import { type RouteParamsProps } from 'app/types'

import CmsService from 'services/CMS'
import { buildCmsMetadata } from 'utils/metadata'

import { calculateFetchWindow, getPostCategoryPath } from './utils'

type Props = RouteParamsProps<{ slug: string }>

// ISR: Revalidate every hour - pages generated on-demand, cached for 3600s
export const revalidate = 3600
// Allow dynamic params as fallback for posts published after the build
export const dynamicParams = true

export async function generateStaticParams() {
  if (!features.blog) return []
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    const client = CmsService.getBlogClient()
    const slugs = await client.getPostPaths()
    const params = slugs.map((slug) => ({ slug }))
    if (process.env.LOG_STATIC_PARAMS === 'true') {
      // eslint-disable-next-line no-console
      console.log('[SSG] /blog/[slug]:', JSON.stringify(params))
    }
    return params
  } catch (error) {
    console.error('Failed to generate static params for blog posts', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!features.blog) return {}

  try {
    const { slug } = await params
    const client = CmsService.getBlogClient()
    const post = await client.getPost(slug)

    if (!post) {
      return {
        title: 'Post Not Found'
      }
    }

    return buildCmsMetadata(post, content.cmsMetaDefaults, `/blog/${slug}`, {
      ogType: 'article'
    })
  } catch (error) {
    console.error('Failed to generate metadata for blog post', error)
    return {
      title: 'Error'
    }
  }
}

const BlogPostPage = async ({ params }: Props) => {
  if (!features.blog) notFound()

  const { slug } = await params
  const client = CmsService.getBlogClient()

  // Mirror the building page: a transient CMS outage must degrade to a 40X page, not abort
  // the static export. The post itself is essential; every secondary fetch degrades to empty
  // so a single flaky request (e.g. similar posts) still renders the post.
  try {
    // First, get all post slugs to determine the index
    const allSlugs = (await client.getPostPaths?.()) || []
    const currentIndex = allSlugs.findIndex(
      (s) => s.toLowerCase() === slug.toLowerCase()
    )

    // The slug is not among the CMS post paths — the post does not exist. Return a
    // real 404, not a 200 "Post Not Found" (soft-404).
    if (currentIndex === -1) notFound()

    const { offset, limit } = calculateFetchWindow(
      currentIndex,
      allSlugs.length
    )

    // Fetch the current post and the navigation window (shares the index pages' cached
    // paginated requests) in parallel. The window is secondary — degrade it to an empty
    // list so prev/next navigation can't fail the whole render.
    const [post, windowPosts] = await Promise.all([
      client.getPost(slug),
      client.getPosts({ limit, offset }).catch(() => [])
    ])

    if (!post) notFound()

    // The category path and the similar-posts candidate pool both depend on the resolved
    // post (its categories/tags), so fetch them after. getRelatedPosts queries only posts
    // sharing a category/tag; non-WP clients fall back to a plain post list. Both are
    // secondary — degrade to empty rather than failing the post that did load.
    const [path, relatedPosts] = await Promise.all([
      getPostCategoryPath(post.categories, client).catch(() => undefined),
      (blogConfig.similarPostsCount > 0
        ? (client.getRelatedPosts?.(post, {
            poolSize: blogConfig.similarPoolSize
          }) ?? client.getPosts())
        : Promise.resolve([])
      ).catch(() => [])
    ])

    // Find previous and next posts within the fetched window
    const windowIndex = windowPosts.findIndex(
      (p) => p.slug.toLowerCase() === slug.toLowerCase()
    )
    const nextPost = windowIndex > 0 ? windowPosts[windowIndex - 1] : null
    const previousPost =
      windowIndex < windowPosts.length - 1 ? windowPosts[windowIndex + 1] : null

    return (
      <BlogPostTemplate>
        <BlogPostPageContent
          post={post}
          path={path}
          allPosts={relatedPosts}
          nextPost={nextPost}
          previousPost={previousPost}
        />
      </BlogPostTemplate>
    )
  } catch (error) {
    // notFound() above throws a NEXT_NOT_FOUND control-flow signal — it MUST propagate,
    // otherwise this catch would swallow it and turn the real 404 back into a soft-404 (200).
    // Only genuine failures (e.g. a transient CMS outage) fall through to the 40X page.
    unstable_rethrow(error)
    console.error('Failed to render blog post page', error)
    return <Page40XTemplate />
  }
}

export default BlogPostPage

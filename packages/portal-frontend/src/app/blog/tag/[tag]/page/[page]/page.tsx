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

type Props = RouteParamsProps<{ tag: string; page: string }>

// ISR: Revalidate every hour - pages generated on-demand, cached for 3600s
export const revalidate = 3600
// Allow dynamic params - generate pages on first request instead of at build time
export const dynamicParams = true

// Disabled for ISR - kept for reference
export async function _generateStaticParams_disabled() {
  try {
    const client = CmsService.getBlogClient()
    const posts = await client.getPosts()

    // Extract all unique tags
    const tagsMap = new Map<string, number>()
    posts.forEach((post) => {
      post.tags?.forEach((tag) => {
        tagsMap.set(tag.slug, (tagsMap.get(tag.slug) || 0) + 1)
      })
    })

    const params: Array<{ tag: string; page: string }> = []

    // Generate params for each tag with pagination
    tagsMap.forEach((count, tag) => {
      const totalPages = Math.ceil(count / postsPerPage)
      for (let i = 1; i <= totalPages; i++) {
        params.push({ tag, page: String(i) })
      }
    })

    return params
  } catch (error) {
    console.error('Failed to generate static params for blog tag pages', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag, page } = await params
  const pageNum = parseInt(page, 10)
  const meta = content.pagesMeta.blogTagPage

  return {
    title: String(meta?.title ?? '')
      .replace('{tag}', tag)
      .replace('{page}', String(pageNum)),
    description: String(meta?.description ?? '').replace('{tag}', tag),
    openGraph: { type: 'website' as const, siteName: content.siteName },
    alternates: {
      canonical:
        pageNum === 1
          ? `${routes.blog}/tag/${tag}`
          : `${routes.blog}/tag/${tag}/page/${pageNum}`
    }
  }
}

const BlogTagPagedPage = async ({ params }: Props) => {
  if (!features.blog) notFound()

  const { tag, page } = await params
  const pageNum = parseInt(page, 10)
  const currentPage = pageNum - 1 // Convert to 0-based

  if (isNaN(pageNum) || pageNum < 1) {
    notFound()
  }

  const client = CmsService.getBlogClient()

  const [posts, totalPosts] = await Promise.all([
    client.getPosts({
      tag,
      limit: postsPerPage,
      offset: currentPage * postsPerPage
    }),
    client.getTotalPosts({ tag })
  ])

  if (pageNum > 1 && posts.length === 0) {
    notFound()
  }

  return (
    <StaticPageTemplate title="Blog">
      <BlogTagPageContent
        tag={tag}
        posts={posts}
        currentPage={currentPage}
        totalPosts={totalPosts}
      />
    </StaticPageTemplate>
  )
}

export default BlogTagPagedPage

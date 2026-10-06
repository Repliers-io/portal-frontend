import React from 'react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import blogConfig from '@configs/blog'
import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { StaticPageTemplate } from '@templates'
import { BlogCategoryPageContent } from '@pages/blog'

import { type RouteParamsProps } from 'app/types'

import CmsService from 'services/CMS'

const { postsPerPage } = blogConfig

type Props = RouteParamsProps<{ category: string[] }>

// ISR: Revalidate every hour - pages generated on-demand, cached for 3600s
export const revalidate = 3600
// Allow dynamic params - generate pages on first request instead of at build time
export const dynamicParams = true

/**
 * Parse category URL segments to extract slug and page number
 * Handles URLs like: /category/tech or /category/tech/page/2
 */
function parseCategoryUrl(category: string[]) {
  const paginated =
    category.length >= 2 && category[category.length - 2] === 'page'
  const pageNum = paginated ? parseInt(category[category.length - 1], 10) : 1
  const slug = paginated
    ? category[category.length - 3]
    : category[category.length - 1]

  return { paginated, pageNum, slug }
}

// Disabled for ISR - kept for reference
export async function _generateStaticParams_disabled() {
  try {
    const client = CmsService.getBlogClient()
    const posts = await client.getPosts()
    const categories = await client.getCategories()

    // Extract all unique categories with counts
    const categoriesMap = new Map<string, number>()
    posts.forEach((post) => {
      post.categories?.forEach((cat) => {
        categoriesMap.set(cat.slug, (categoriesMap.get(cat.slug) || 0) + 1)
      })
    })

    const params: Array<{ category: string[] }> = []

    // Generate paths for each category (first page)
    for (const cat of categories) {
      const path = await client.getCategoryPath(cat.slug)
      params.push({
        category: path.length ? path.map((c) => c.slug) : [cat.slug]
      })
    }

    // Generate paginated paths
    for (const [categorySlug, count] of categoriesMap) {
      const totalPages = Math.ceil(count / blogConfig.postsPerPage)
      const categoryPath = await client.getCategoryPath(categorySlug)
      const basePath = categoryPath.length
        ? categoryPath.map((c) => c.slug)
        : [categorySlug]

      for (let i = 2; i <= totalPages; i++) {
        params.push({
          category: [...basePath, 'page', String(i)]
        })
      }
    }

    return params
  } catch (error) {
    console.error('Failed to generate static params for blog categories', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const { pageNum, slug } = parseCategoryUrl(category)
  const meta = content.pagesMeta.blogCategory

  const baseTitle = String(meta?.title ?? '').replace('{category}', slug)

  return {
    title: pageNum > 1 ? `${baseTitle} - Page ${pageNum}` : baseTitle,
    description: String(meta?.description ?? '').replace('{category}', slug),
    openGraph: { type: 'website' as const, siteName: content.siteName },
    alternates: { canonical: `${routes.blog}/category/${category.join('/')}` }
  }
}

const BlogCategoryPage = async ({ params }: Props) => {
  if (!features.blog) notFound()

  const { category } = await params
  const { paginated, pageNum, slug } = parseCategoryUrl(category)

  if (paginated && (isNaN(pageNum) || pageNum < 1)) {
    notFound()
  }

  const currentPage = pageNum - 1 // Convert 1-based to 0-based
  const client = CmsService.getBlogClient()

  const [posts, categoryPath, totalPosts] = await Promise.all([
    client.getPosts({
      limit: postsPerPage,
      offset: currentPage * postsPerPage,
      category: slug
    }),
    client.getCategoryPath(slug),
    client.getTotalPosts({ category: slug })
  ])

  if (pageNum > 1 && posts.length === 0) {
    notFound()
  }

  return (
    <StaticPageTemplate title="Blog">
      <BlogCategoryPageContent
        posts={posts}
        currentPage={currentPage}
        category={slug}
        categoryPath={categoryPath}
        totalPosts={totalPosts}
      />
    </StaticPageTemplate>
  )
}

export default BlogCategoryPage

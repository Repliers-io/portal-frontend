import blogConfig from '@configs/blog'

import { type BlogCategory, type CmsClient } from 'services/CMS'

export const calculateFetchWindow = (
  currentIndex: number,
  totalPosts: number
): { offset: number; limit: number } => {
  const postsPerPage = blogConfig.postsPerPage
  const pageIndex = Math.floor(currentIndex / postsPerPage)
  const positionInPage = currentIndex % postsPerPage

  // For posts at page boundaries (last 2 of page or first 2 of page)
  const nearPageBoundary =
    positionInPage >= postsPerPage - 2 || positionInPage <= 1

  if (nearPageBoundary && currentIndex > 0 && currentIndex < totalPosts - 1) {
    // Fetch window around current post: prev 2 + current + next 2
    return {
      offset: Math.max(0, currentIndex - 2),
      limit: 5
    }
  }

  // Fetch entire current page
  return {
    offset: pageIndex * postsPerPage,
    limit: postsPerPage
  }
}

/**
 * Get full category path for a post's first category
 * @param categories - Array of BlogCategory objects from the post
 * @param client - CMS client instance
 * @returns Array of BlogCategory objects representing the full path, or undefined if no categories
 */
export const getPostCategoryPath = async (
  categories: BlogCategory[] | undefined,
  client: CmsClient
): Promise<BlogCategory[] | undefined> => {
  if (!categories || categories.length === 0) {
    return undefined
  }

  return client.getCategoryPath(categories[0].slug)
}

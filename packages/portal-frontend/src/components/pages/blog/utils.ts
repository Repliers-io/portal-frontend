import dayjs from 'dayjs'

import blogConfig from '@configs/blog'

import { type Post } from 'services/CMS'

/**
 * Format blog date according to config
 */
export const formatBlogDate = (
  date: Date | string,
  format: keyof typeof blogConfig.dateFormats = 'postCard'
) => {
  return dayjs(date).format(blogConfig.dateFormats[format])
}

type FindSimilarPostsOptions = {
  currentPost: Post
  allPosts: Post[]
  limit: number
  excludePosts?: Post[]
  includeCategories?: boolean
}

/**
 * Find posts similar to the current post based on shared categories and tags.
 * Posts are scored with category matches having higher priority than tag matches.
 * Returns posts sorted by similarity score (descending).
 *
 * @param options - Configuration options
 * @param options.currentPost - The current post to find similar posts for
 * @param options.allPosts - List of all posts to search through
 * @param options.limit - Maximum number of similar posts to return
 * @param options.excludePosts - Posts to exclude from results (e.g., navigation posts)
 * @param options.includeCategories - Whether to include category matching in similarity score
 * @returns Array of similar posts, sorted by similarity score
 */
export const findSimilarPosts = ({
  currentPost,
  allPosts,
  limit,
  excludePosts = [],
  includeCategories = true
}: FindSimilarPostsOptions): Post[] => {
  const currentTags = currentPost.tags || []
  const currentCategories = currentPost.categories || []
  const excludeIds = new Set([currentPost.id, ...excludePosts.map((p) => p.id)])

  // Calculate similarity score for each post
  const postsWithScores = allPosts
    .filter((post) => !excludeIds.has(post.id))
    .map((post) => {
      const postTags = post.tags || []
      const postCategories = post.categories || []

      // Count common categories (higher weight) if enabled
      const commonCategories = includeCategories
        ? postCategories.filter((cat) =>
            currentCategories.some((c) => c.slug === cat.slug)
          )
        : []

      // Count common tags (lower weight)
      const commonTags = postTags.filter((tag) =>
        currentTags.some((t) => t.slug === tag.slug)
      )

      // Score: categories worth 10 points each, tags worth 1 point each
      const categoryScore = commonCategories.length * 10
      const tagScore = commonTags.length

      return {
        post,
        score: categoryScore + tagScore
      }
    })
    .filter((item) => item.score > 0) // Only include posts with at least one match

  // Sort by score (descending), breaking ties by recency (newest first), and return top N
  return postsWithScores
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const bDate = b.post.publishedAt?.getTime() ?? 0
      const aDate = a.post.publishedAt?.getTime() ?? 0
      return bDate - aDate
    })
    .slice(0, limit)
    .map((item) => item.post)
}

import { Stack } from '@mui/material'

import {
  // type BlogCategory,
  // type BlogTag,
  type Post
} from 'services/CMS'

import {
  // BlogCategoryTree,
  // BlogTagsBrowser,
  BlogPostsGrid
} from './components'

type BlogIndexPageContentProps = {
  posts: Post[]
  // categories: BlogCategory[]
  // tags: BlogTag[]
  currentPage: number // 0-based
  totalPosts: number
}

export const BlogIndexPageContent = ({
  posts,
  // categories,
  // tags,
  currentPage,
  totalPosts
}: BlogIndexPageContentProps) => {
  return (
    <Stack spacing={4}>
      {/* Category Tree */}
      {/* {categories.length > 0 && (
          <BlogCategoryTree categories={categories} showEmpty={true} />
        )} */}

      {/* Tag Cloud */}
      {/* {tags.length > 0 && <BlogTagsBrowser tags={tags} />} */}

      {/* Posts Grid */}
      <BlogPostsGrid
        posts={posts}
        currentPage={currentPage}
        totalPosts={totalPosts}
        showCategory={true}
      />
    </Stack>
  )
}

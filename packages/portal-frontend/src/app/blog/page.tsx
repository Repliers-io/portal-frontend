import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import blogConfig from '@configs/blog'
import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { StaticPageTemplate } from '@templates'
import { BlogIndexPageContent } from '@pages/blog'

import CmsService from 'services/CMS'

export const metadata: Metadata = {
  ...content.pagesMeta.blog,
  alternates: { canonical: routes.blog }
}

// Revalidate every hour
export const revalidate = 3600

const { postsPerPage } = blogConfig

const BlogIndexPage = async () => {
  if (!features.blog) notFound()

  const client = CmsService.getBlogClient()

  // Category tree / tag cloud on the index page are planned but not shipped —
  // re-enable these fetches together with the props in BlogIndexPageContent.
  const [posts, totalPosts] = await Promise.all([
    client.getPosts({ limit: postsPerPage }),
    client.getTotalPosts()
    // client.getCategories(),
    // client.getTags()
  ])

  return (
    <StaticPageTemplate title="Blog">
      <BlogIndexPageContent
        posts={posts}
        // tags={tags}
        // categories={categories}
        totalPosts={totalPosts}
        currentPage={0}
      />
    </StaticPageTemplate>
  )
}

export default BlogIndexPage

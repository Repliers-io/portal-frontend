import React from 'react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import blogConfig from '@configs/blog'
import features from '@configs/features'
import routes from '@configs/routes'
import { AuthorPageContent } from '@pages/blog'

import { type RouteParamsProps } from 'app/types'

import CmsService, { type WordPressClient } from 'services/CMS'

type Props = RouteParamsProps<{ slug: string }>

// Allow authors added after build to be rendered on-demand
export const dynamicParams = true
export const revalidate = 86400

export async function generateStaticParams() {
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    const { featuredAuthors } = blogConfig

    // If tenant defines a featured authors whitelist — pre-generate only those
    if (featuredAuthors?.length) {
      const params = featuredAuthors.map((slug) => ({ slug }))
      if (process.env.LOG_STATIC_PARAMS === 'true') {
        // eslint-disable-next-line no-console
        console.log('[SSG] /author/[slug]:', JSON.stringify(params))
      }
      return params
    }

    // Otherwise pre-generate all authors from CMS
    const client = CmsService.getBlogClient()
    const authors = await client.getAuthors()
    const params = authors.map(({ slug }) => ({ slug }))
    if (process.env.LOG_STATIC_PARAMS === 'true') {
      // eslint-disable-next-line no-console
      console.log('[SSG] /author/[slug]:', JSON.stringify(params))
    }
    return params
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  try {
    const client = CmsService.getBlogClient()
    const author = await client.getAuthorBySlug(slug)

    if (!author) {
      return { title: 'Author Not Found' }
    }

    return {
      title: author.name,
      description: author.bio || `Read posts by ${author.name}`,
      alternates: { canonical: `${routes.author}/${slug}` },
      openGraph: {
        type: 'website' as const,
        title: author.name,
        url: `${routes.author}/${slug}`
      }
    }
  } catch {
    return { title: 'Author' }
  }
}

const AuthorPage = async ({ params }: Props) => {
  if (!features.blog) notFound()

  const { slug } = await params
  const client = CmsService.getBlogClient() as WordPressClient
  const author = await client.getAuthorBySlug(slug)

  if (!author) notFound()

  const [news, reviews] = await Promise.all([
    // client.getPostsByAuthor(author.id, { limit: 6 }),
    client.getCustomPostsByAuthor('news', author.id, { limit: 3 }),
    client.getCustomPostsByAuthor('review', author.id, { limit: 12 })
  ])

  return <AuthorPageContent author={author} news={news} reviews={reviews} />
}

export default AuthorPage

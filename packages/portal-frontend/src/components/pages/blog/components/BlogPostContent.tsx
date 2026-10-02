'use client'

import React from 'react'

import { CmsContentRenderer } from '@shared/CmsContentRenderer'

import { type Page, type Post } from 'services/CMS'

type BlogPostContentProps = {
  post: Post | Page
}

export const BlogPostContent = ({ post }: BlogPostContentProps) => {
  const content = post.contentRaw || post.content
  // Use raw format if contentRaw is available, otherwise treat as HTML
  const format = post.contentRaw ? 'raw' : 'html'

  return <CmsContentRenderer content={content} format={format} />
}

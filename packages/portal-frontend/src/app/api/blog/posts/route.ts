import { type NextRequest, NextResponse } from 'next/server'
import queryString from 'query-string'

import blogConfig from '@configs/blog'

import CmsService from 'services/CMS'

export async function GET(request: NextRequest) {
  try {
    const params = queryString.parse(request.nextUrl.search, {
      parseNumbers: true
    })
    const limit = (params.limit as number) || blogConfig.postsPerPage
    const offset = (params.offset as number) || 0
    const tag = params.tag as string | undefined
    const category = params.category as string | undefined

    const client = CmsService.getBlogClient()

    const posts = await client.getPosts({
      limit,
      offset,
      tag,
      category
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Failed to fetch blog posts', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

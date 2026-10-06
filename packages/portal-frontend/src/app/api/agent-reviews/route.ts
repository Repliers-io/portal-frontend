import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

import { MoveSmartlyAPI } from 'services/MoveSmartly'

import { assertSameOrigin, getClientIp, parseBody, parseQuery } from '../_lib'

import { createReviewBodySchema, reviewsQuerySchema } from './schema'

export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  const parsed = parseQuery(request, reviewsQuerySchema)
  if (!parsed.ok) return parsed.response

  try {
    const reviews = await MoveSmartlyAPI.fetchAgentReviews(parsed.value)
    return NextResponse.json(reviews)
  } catch (err) {
    console.error('[GET /api/agent-reviews]', err)
    return NextResponse.json(
      { error: 'Failed to fetch agent reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  const parsed = await parseBody(request, createReviewBodySchema)
  if (!parsed.ok) return parsed.response

  try {
    const postIpAddress = getClientIp(request)
    await MoveSmartlyAPI.createAgentReview({ ...parsed.value, postIpAddress })

    // invalidate reviews about/reviews pages for avoid 1hr TTL
    revalidatePath('/reviews')
    revalidatePath('/about')

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(
      '[POST /api/agent-reviews]',
      err instanceof Error ? err.message : err
    )
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
